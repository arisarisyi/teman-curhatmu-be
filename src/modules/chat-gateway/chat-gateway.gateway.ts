import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // Sesuaikan jika diperlukan
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Ketika client terkoneksi, periksa query parameter untuk topicId.
   * Jika tersedia, otomatis join room dengan nama topicId.
   */
  handleConnection(@ConnectedSocket() client: Socket) {
    const topicId = client.handshake.query.topicId as string;
    if (topicId) {
      client.join(topicId);
      client.emit('subscribed', { topicId });
    }
  }

  /**
   * Opsional: Client dapat mengirim event "unsubscribe" untuk keluar dari room.
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody('topicId') topicId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(topicId);
    client.emit('unsubscribed', { topicId });
  }

  /**
   * Listener untuk event 'chat.messageSaved' yang di-emit oleh ChatService.
   * Pesan baru akan di-broadcast hanya ke client yang berada di room (topicId) yang sesuai.
   */
  @OnEvent('chat.messageSaved')
  handleMessageSaved(message: any) {
    const topicId = message.topic;
    this.server.to(topicId).emit('chatMessage', message);
  }
}
