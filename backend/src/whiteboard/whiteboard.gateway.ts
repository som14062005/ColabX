import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class WhiteboardGateway {
  @WebSocketServer()
  server: Server;

  // Existing: Broadcast full canvas updates
  @SubscribeMessage('canvas-data')
  handleCanvasUpdate(@MessageBody() data: any) {
    this.server.emit('canvas-data', data);
  }

  // NEW: Broadcast when a new object (shape, line, text, etc.) is added
  @SubscribeMessage('object-added')
  handleAddObject(client: Socket, @MessageBody() payload: any) {
    this.server.emit('object-added', { ...payload, senderId: client.id });
  }
}