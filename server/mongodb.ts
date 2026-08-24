import { MongoClient, Db, Collection, Document } from 'mongodb';

// Name of the shared customers database on the same cluster
const CUSTOMERS_DB_NAME = 'customersdb';
export const DIGITAL_MENU_DB_NAME = 'bungle';

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.client && this.db) {
      return;
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    this.connectPromise = (async () => {
      try {
        const client = new MongoClient(uri);
        await client.connect();

        // Always use "POS" as the database name so POS data is isolated
        // from any other databases (e.g. "Orders") on the same cluster.
        this.client = client;
        this.db = client.db('POS');

        console.log(`✅ Connected to MongoDB database: POS`);
      } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
      } finally {
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDatabase().collection<T>(name);
  }

  getDatabaseByName(name: string): Db {
    if (!this.client) throw new Error('Database not connected. Call connect() first.');
    return this.client.db(name);
  }

  /**
   * Returns a collection from the shared `customersdb` database on the same
   * cluster. The MongoClient is already connected; we just switch databases.
   */
  getCustomersCollection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.client) throw new Error('Database not connected. Call connect() first.');
    return this.client.db(CUSTOMERS_DB_NAME).collection<T>(name);
  }

  async disconnect(): Promise<void> {
    if (this.connectPromise) {
      await this.connectPromise.catch(() => undefined);
    }
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}

export const mongodb = new MongoDBService();
