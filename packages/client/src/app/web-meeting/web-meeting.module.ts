import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WebRTCModule } from '../shared/services/web-rtc.module';
import { WebMeetingComponent } from './web-meeting.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: WebMeetingComponent }])],
    exports: [RouterModule]
})
export class MediaTestRoutingModule { }

@NgModule({
    declarations: [WebMeetingComponent],
    imports: [
        CommonModule,
        MediaTestRoutingModule,
        WebRTCModule,
    ]
})
export class WebMeetingModule { }