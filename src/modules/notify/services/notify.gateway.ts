import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { NotifyI } from '../dto/notify.dto.js';

@WebSocketGateway({
  path: '/ms-cms/notify-socket',
  cors: {
    origin: '*',
  },
})
export class NotifyGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendNotification')
  handleNotification(
    @MessageBody() data: NotifyI,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('receiveNotification', data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roleId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roleId);
  }

  sendToUser(roleId: string, notification: NotifyI) {
    this.server.to(roleId).emit('receiveNotification', notification);
  }
}
