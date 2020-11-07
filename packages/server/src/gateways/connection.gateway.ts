import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'signaling' })
export class ConnectionGateway {
    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: any) {
        console.log('message', payload.type)
        this.server.clients().emit('message', payload);
    }
}
