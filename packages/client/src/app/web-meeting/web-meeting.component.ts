import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebRTCService } from '../shared/services/web-rtc.service';

@Component({
    selector: 'app-web-meeting',
    templateUrl: './web-meeting.component.html',
    styleUrls: ['./web-meeting.component.scss']
})
export class WebMeetingComponent implements OnInit, OnDestroy {
    isLoading = true;

    get localMediaStream() { return this.webRtcService.localMediaStream; }
    get remoteMediaStream() { return this.webRtcService.remoteMediaStream; }
    get isAvailableLoalMedia() { return this.localMediaStream?.getTracks().length; }
    get isAvailableRemoteMedia() { return this.remoteMediaStream?.getTracks().length; }

    constructor(private webRtcService: WebRTCService, private activatedRoute: ActivatedRoute) { }

    async ngOnInit() {
        if (this.activatedRoute.snapshot.queryParams?.host) {
            this.webRtcService.connectionAsHost({ audio: true, video: true });
        } else {
            this.webRtcService.connectionAsClient({ audio: true, video: true });
        }
        this.isLoading = false;
    }

    ngOnDestroy() {
        this.webRtcService.disconnect();
    }
}