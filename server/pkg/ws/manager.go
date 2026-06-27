package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Client WebSocket 客户端
type Client struct {
	Hub  *Hub
	Conn *websocket.Conn
	Send chan []byte
	Room string
}

// Hub WebSocket 连接管理器
type Hub struct {
	// 房间 -> 客户端集合
	Rooms map[string]map[*Client]bool

	// 注册请求
	Register chan *Client

	// 注销请求
	Unregister chan *Client

	// 广播消息
	Broadcast chan *Message

	mu sync.RWMutex
}

// Message 广播消息
type Message struct {
	Room string
	Data []byte
}

// Upgrader WebSocket 升级器
var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 允许所有来源（开发环境）
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// NewHub 创建 WebSocket 管理器
func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message),
	}
}

// Run 启动 Hub 事件循环
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Rooms[client.Room] == nil {
				h.Rooms[client.Room] = make(map[*Client]bool)
			}
			h.Rooms[client.Room][client] = true
			h.mu.Unlock()
			log.Printf("客户端加入房间: %s", client.Room)

		case client := <-h.Unregister:
			h.mu.Lock()
			if room, ok := h.Rooms[client.Room]; ok {
				if _, ok := room[client]; ok {
					delete(room, client)
					close(client.Send)
					if len(room) == 0 {
						delete(h.Rooms, client.Room)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("客户端离开房间: %s", client.Room)

		case message := <-h.Broadcast:
			h.mu.RLock()
			if room, ok := h.Rooms[message.Room]; ok {
				for client := range room {
					select {
					case client.Send <- message.Data:
					default:
						// 发送失败，关闭连接
						h.mu.RUnlock()
						h.mu.Lock()
						delete(room, client)
						close(client.Send)
						h.mu.Unlock()
						h.mu.RLock()
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// ReadPump 读取客户端消息
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		// 将消息广播到房间
		c.Hub.Broadcast <- &Message{
			Room: c.Room,
			Data: message,
		}
	}
}

// WritePump 向客户端写入消息
func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Send
		if !ok {
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}
