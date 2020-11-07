import { NgModule } from '@angular/core';
import { SignalingService } from './signaling.service';
import { WebRTCService } from './web-rtc.service';

@NgModule({
    providers: [
        WebRTCService,
        SignalingService,
    ],
})
export class WebRTCModule { }