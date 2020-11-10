import { Injectable } from '@angular/core';
import { SignalingService, MessageType } from './signaling.service';

/**
 * 参考：https://developer.mozilla.org/ja/docs/Web/API/WebRTC_API/Connectivity#%E3%82%B7%E3%82%B0%E3%83%8A%E3%83%AA%E3%83%B3%E3%82%B0
 */
@Injectable()
export class WebRTCService {
    localMediaStream: MediaStream;
    remoteMediaStream: MediaStream = new MediaStream();
    private isHost: boolean;

    constructor(private signaling: SignalingService) { }

    /**
     * ホストとして接続
     */
    async connectionAsHost(constraints: MediaStreamConstraints) {
        this.isHost = true;
        try {
            // 1. ホスト側のメディアストリームを取得
            this.localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            // 2. ホスト側でPeerConnectionを作成し、トラックを追加
            const pc = this.createPeerConnection();
            this.localMediaStream.getTracks().forEach(track => pc.addTrack(track, this.localMediaStream));

            this.signaling.init();
            // ソケット接続時にオファーを送信
            this.signaling.onconnect = () => this.sendOffer(pc);
            this.signaling.onmessage = this.handleMessage(pc);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * クライアントとして接続
     */
    async connectionAsClient(constraints: MediaStreamConstraints) {
        this.isHost = false;
        try {
            this.localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            const pc = this.createPeerConnection();

            this.signaling.init();
            // クライアント接続時にホストからofferを送ってもらうためにシグナル送信
            this.signaling.onconnect = () => this.signaling.sendMessage('connect_client', null);
            this.signaling.onmessage = this.handleMessage(pc);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * 切断
     */
    disconnect() {
        // メディアを停止
        [this.localMediaStream, this.remoteMediaStream].forEach(stream => stream?.getTracks().forEach(track => track.stop()));
        // ソケット切断
        this.signaling.disconnect();
    }

    private createPeerConnection() {
        const pcConfig: RTCConfiguration = {
            iceServers: [
                { urls: "stun:www.teracy.tk:3478" },
                { urls: "turn:www.teracy.tk:3478?transport=udp", "username": "username", "credential": "password" },
                { urls: "turn:www.teracy.tk:3478?transport=tcp", "username": "username", "credential": "password" },
            ]
        };

        const pc = new RTCPeerConnection(pcConfig);
        // リモートのトラック受信
        pc.addEventListener('track', (event: RTCTrackEvent) => this.remoteMediaStream.addTrack(event.track));
        // 5． ICE候補を追加
        pc.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.signaling.sendMessage('new-ice-candidate', event.candidate);
            }
        });

        return pc;
    }

    private async sendOffer(peerConnection: RTCPeerConnection) {
        // 3. オファーを作成
        const offer = await peerConnection.createOffer();
        // 4. 作成したオファーをローカル接続の記述として設定
        await peerConnection.setLocalDescription(offer);
        // 6. オファーを送信
        this.signaling.sendMessage('offer', offer);
    }

    private handleMessage(peerConnection: RTCPeerConnection,) {
        return async (type: MessageType, data: any) => {
            switch (type) {
                case 'offer':
                    if (!this.isHost) {
                        // 7. クライアント側で受信したofferをリモート側の接続情報としてセット
                        const remoteDesc = new RTCSessionDescription(data);
                        await peerConnection.setRemoteDescription(remoteDesc);
                        // 8. ローカルのメディアトラックをピア接続にアタッチ
                        this.localMediaStream.getTracks().forEach(track => peerConnection.addTrack(track, this.localMediaStream));
                        // 9. アンサー作成
                        const answer = await peerConnection.createAnswer();
                        // 10. アンサーをローカルの接続情報としてセット
                        await peerConnection.setLocalDescription(answer);
                        // 11. アンサーを送信
                        this.signaling.sendMessage('answer', answer);
                    }
                    break;
                case 'answer':
                    // 12. ホスト側でアンサーを受信
                    if (this.isHost) {
                        // 13. アンサーをリモート側の接続情報としてセット
                        const remoteDesc = new RTCSessionDescription(data);
                        await peerConnection.setRemoteDescription(remoteDesc);
                    }
                    break;
                case 'connect_client':
                    if (this.isHost) {
                        // クライアントが接続してきたらオファーを投げてやる
                        this.sendOffer(peerConnection);
                    }
                    break;
                case 'new-ice-candidate': peerConnection.addIceCandidate(data); break;
            }
        }
    }

}