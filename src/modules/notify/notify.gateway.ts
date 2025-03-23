import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotifyI } from './dto/notify.dto';

@WebSocketGateway({
  path: '/ms-cms/notify-socket', // 🔹 Asegúrate de que esta ruta es correcta
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
