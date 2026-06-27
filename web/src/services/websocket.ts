type MessageHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected: boolean = false;

  constructor(url: string = `ws://${window.location.hostname}:8080/ws`) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected', null);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', null);
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        this.emit('error', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;
          if (type && this.handlers.has(type)) {
            this.handlers.get(type)!.forEach(handler => handler(payload));
          }
        } catch (e) {
          console.warn('WebSocket 消息解析失败:', e);
        }
      };
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      this.reconnect();
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  private emit(type: string, data: any): void {
    this.handlers.get(type)?.forEach(handler => handler(data));
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  isOpen(): boolean {
    return this.isConnected;
  }
}

// 单例
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(url?: string): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(url);
  }
  return wsClient;
}
