import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';

export type MessageType = 'offer' | 'answer' | 'connect_client' | 'new-ice-candidate';
interface SignalingMessage {
    type: MessageType;
    data: any;
}

@Injectable()
export class SignalingService {
    private socket: SocketIOClient.Socket;
    onconnect: () => void;
    ondisconnect: () => void;
    onmessage: (type: MessageType, data: any) => void;

    /**
     * シグナリングサーバーと接続
     */
    init() {
        this.socket = io(environment.signalingServerUrl, {});
        this.socket.on('connect', () => {
            if (this.onconnect) {
                this.onconnect();
            }
        });
        this.socket.on('disconnect', () => {
            if (this.ondisconnect) {
                this.ondisconnect()
            }
        });
        this.socket.on('message', (event: SignalingMessage) => this.onmessage(event.type, event.data));
    }

    /**
     * シグナリングサーバーから切断
     */
    disconnect() {
        this.socket?.disconnect();
    }

    sendMessage(type: MessageType, data: any) {
        const message: SignalingMessage = { type, data };
        this.socket?.emit('message', message);
    }

}
