import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  const failedAttemptsRef = useRef(0);
  const MAX_FAILED_ATTEMPTS = 3;

  useEffect(() => {
    isMountedRef.current = true;

    const connect = () => {
      if (!isMountedRef.current) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        failedAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'table_created':
            case 'table_updated':
            case 'table_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              break;
            case 'order_created':
            case 'order_updated':
            case 'order_completed':
            case 'order_paid':
              queryClient.invalidateQueries({ queryKey: ['/api/orders'], exact: true });
              queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
              queryClient.invalidateQueries({ queryKey: ['/api/orders/completed'] });
              queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              if (message.data?.id) {
                queryClient.invalidateQueries({
                  queryKey: ['/api/orders', message.data.id],
                });
              }
              if (message.type === 'order_updated') {
                queryClient.invalidateQueries({
                  queryKey: ['/api/orders', 'items', 'batch'],
                });
              }
              break;
            case 'order_item_added':
            case 'order_items_added':
            case 'order_item_updated':
            case 'order_item_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/orders'], exact: true });
              queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
              queryClient.invalidateQueries({ queryKey: ['/api/orders/completed'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              if (message.data?.orderId) {
                queryClient.invalidateQueries({
                  queryKey: ['/api/orders', message.data.orderId],
                });
              }
              queryClient.invalidateQueries({
                queryKey: ['/api/orders', 'items', 'batch'],
              });
              break;
            case 'menu_created':
            case 'menu_updated':
            case 'menu_deleted':
            case 'menu_synced':
            case 'digital_menu_synced':
              queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
              queryClient.invalidateQueries({ queryKey: ['/api/menu/pos'] });
              queryClient.invalidateQueries({ queryKey: ['/api/menu/categories'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({
                queryKey: ['/api/orders', 'items', 'batch'],
              });
              break;
            case 'floor_created':
            case 'floor_updated':
            case 'floor_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/floors'] });
              queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
              break;
            case 'invoice_created':
            case 'invoice_updated':
            case 'invoice_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              break;
            case 'data_cleared':
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
              queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
              queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
              queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
              break;
            case 'inventory_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
              break;
            case 'kot_created':
              queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
              queryClient.invalidateQueries({ queryKey: ['/api/orders/completed'] });
              queryClient.invalidateQueries({
                queryKey: ['/api/orders', 'items', 'batch'],
              });
              break;
            default:
              break;
          }
        } catch {
        }
      };

      ws.onclose = () => {
        if (isMountedRef.current) {
          failedAttemptsRef.current += 1;
          if (failedAttemptsRef.current >= MAX_FAILED_ATTEMPTS) {
            return;
          }
          reconnectTimeoutRef.current = setTimeout(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return wsRef.current;
}
