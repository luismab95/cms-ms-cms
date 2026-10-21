import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { config as resourcesConfig } from 'cms-lib-resources';
import { Server, Socket } from 'socket.io';
import type { NotifyI } from '../dto/notify.dto.js';

const { corsOrigin } = resourcesConfig.server;

@WebSocketGateway({
  path: '/ms-cms/notify-socket',
  cors: {
    origin: corsOrigin,
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
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
  }

  sendToUser(userId: string, notification: NotifyI) {
    this.server.to(userId).emit('receiveNotification', notification);
  }
}
