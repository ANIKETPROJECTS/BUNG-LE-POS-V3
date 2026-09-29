import { createHash } from 'node:crypto';
import { MongoClient, Db, Collection, Document } from 'mongodb';
import { mongodb } from './mongodb';

interface ConnectionInfo {
  client: MongoClient;
  db: Db;
  connectionKey: string;
  isShared: boolean;
  lastUsed: number;
  restaurantIds: Set<string>;
}

const TENANT_POOL_OPTIONS = {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxConnecting: 1,
  maxIdleTimeMS: 60_000,
};

class DynamicMongoDBManager {
  private connections = new Map<string, ConnectionInfo>();
  private poolsByUri = new Map<string, ConnectionInfo>();
  private connectionPromises = new Map<string, Promise<ConnectionInfo>>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CONNECTION_TTL = 5 * 60 * 1000;

  constructor() {
    this.startCleanupJob();
  }

  private startCleanupJob() {
    this.cleanupInterval = setInterval(() => {
      void this.cleanupIdleConnections().catch((error) => {
        console.error('Failed to clean up idle MongoDB pools:', error);
      });
    }, 60 * 1000);
    this.cleanupInterval.unref();
  }

  private getConnectionKey(uri: string): string {
    return createHash('sha256').update(uri).digest('hex');
  }

  private attachRestaurant(restaurantId: string, connection: ConnectionInfo): void {
    const previous = this.connections.get(restaurantId);
    if (previous && previous !== connection) {
      previous.restaurantIds.delete(restaurantId);
    }

    connection.restaurantIds.add(restaurantId);
    connection.lastUsed = Date.now();
    this.connections.set(restaurantId, connection);
  }

  private async refreshSharedClient(connection: ConnectionInfo): Promise<void> {
    if (!connection.isShared) return;

    const client = await mongodb.getClient();
    if (connection.client !== client) {
      connection.client = client;
      connection.db = client.db('POS');
    }
  }

  async getConnection(
    restaurantId: string,
    mongodbUri: string,
  ): Promise<{ client: MongoClient; db: Db }> {
    const connectionKey = this.getConnectionKey(mongodbUri);
    const existing = this.connections.get(restaurantId);

    if (existing?.connectionKey === connectionKey) {
      await this.refreshSharedClient(existing);
      existing.lastUsed = Date.now();
      return { client: existing.client, db: existing.db };
    }

    if (existing) {
      this.connections.delete(restaurantId);
      existing.restaurantIds.delete(restaurantId);
    }

    let connection = this.poolsByUri.get(connectionKey);
    if (!connection) {
      let pending = this.connectionPromises.get(connectionKey);

      if (!pending) {
        const created = (async (): Promise<ConnectionInfo> => {
          let client: MongoClient | null = null;
          const isShared = mongodb.usesUri(mongodbUri);

          try {
            if (isShared) {
              client = await mongodb.getClient();
            } else {
              client = new MongoClient(mongodbUri, TENANT_POOL_OPTIONS);
              await client.connect();
            }

            const info: ConnectionInfo = {
              client,
              db: client.db('POS'),
              connectionKey,
              isShared,
              lastUsed: Date.now(),
              restaurantIds: new Set<string>(),
            };
            this.poolsByUri.set(connectionKey, info);

            console.log(
              isShared
                ? 'Reusing the shared MongoDB pool for restaurant storage'
                : 'Connected a pooled MongoDB client for a distinct restaurant database',
            );

            return info;
          } catch (error) {
            if (client && !isShared) {
              await client.close().catch(() => undefined);
            }
            console.error(`Failed to connect to MongoDB for restaurant ${restaurantId}:`, error);
            throw error;
          }
        })();

        this.connectionPromises.set(connectionKey, created);
        void created.finally(() => {
          if (this.connectionPromises.get(connectionKey) === created) {
            this.connectionPromises.delete(connectionKey);
          }
        }).catch(() => undefined);
        pending = created;
      }

      connection = await pending;
    }

    await this.refreshSharedClient(connection);
    this.attachRestaurant(restaurantId, connection);
    return { client: connection.client, db: connection.db };
  }

  getCollection<T extends Document>(
    restaurantId: string,
    collectionName: string,
  ): Collection<T> | null {
    const connection = this.connections.get(restaurantId);
    if (!connection) return null;

    connection.lastUsed = Date.now();
    return connection.db.collection<T>(collectionName);
  }

  getDatabase(restaurantId: string, databaseName: string): Db | null {
    const connection = this.connections.get(restaurantId);
    if (!connection) return null;

    connection.lastUsed = Date.now();
    return connection.client.db(databaseName);
  }

  hasConnection(restaurantId: string): boolean {
    return this.connections.has(restaurantId);
  }

  async closeConnection(restaurantId: string): Promise<void> {
    const connection = this.connections.get(restaurantId);
    if (!connection) return;

    this.connections.delete(restaurantId);
    connection.restaurantIds.delete(restaurantId);

    if (!connection.isShared && connection.restaurantIds.size === 0) {
      this.poolsByUri.delete(connection.connectionKey);
      await connection.client.close();
    }
  }

  private async cleanupIdleConnections(): Promise<void> {
    const now = Date.now();
    const pools: Array<[string, ConnectionInfo]> = [];
    this.poolsByUri.forEach((connection, connectionKey) => {
      pools.push([connectionKey, connection]);
    });

    for (const [connectionKey, connection] of pools) {
      if (connection.isShared || now - connection.lastUsed <= this.CONNECTION_TTL) {
        continue;
      }

      this.poolsByUri.delete(connectionKey);
      const restaurantIds: string[] = [];
      connection.restaurantIds.forEach((restaurantId) => restaurantIds.push(restaurantId));
      for (const restaurantId of restaurantIds) {
        if (this.connections.get(restaurantId) === connection) {
          this.connections.delete(restaurantId);
        }
      }
      connection.restaurantIds.clear();

      await connection.client.close().catch((error: unknown) => {
        console.error('Failed to close an idle tenant MongoDB pool:', error);
      });
    }
  }

  /**
   * Reads a setting from any established restaurant connection.
   * Used by background services that run without a request context.
   */
  async getSettingFromAnyConnection(key: string): Promise<string | undefined> {
    const pools: ConnectionInfo[] = [];
    this.poolsByUri.forEach((connection) => pools.push(connection));

    for (const connection of pools) {
      try {
        const doc = await connection.db
          .collection<{ key: string; value: string }>('settings')
          .findOne({ key } as any);
        if (doc?.value) return doc.value;
      } catch {
        // Ignore a connection-specific error and try the next pool.
      }
    }
    return undefined;
  }

  async closeAll(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    const pending: Promise<ConnectionInfo>[] = [];
    this.connectionPromises.forEach((connectionPromise) => pending.push(connectionPromise));
    await Promise.allSettled(pending);

    const tenantPools: ConnectionInfo[] = [];
    this.poolsByUri.forEach((connection) => {
      if (!connection.isShared) tenantPools.push(connection);
    });
    const closeResults = await Promise.allSettled(
      tenantPools.map((connection) => connection.client.close()),
    );
    closeResults.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('Failed to close a tenant MongoDB pool:', result.reason);
      }
    });

    this.connections.clear();
    this.poolsByUri.clear();
    this.connectionPromises.clear();
  }
}

export const dynamicMongoDB = new DynamicMongoDBManager();