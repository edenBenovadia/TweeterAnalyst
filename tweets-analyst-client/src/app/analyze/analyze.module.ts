import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeContainerComponent } from './analyze-container/analyze-container.component'
import { ChartComponent} from './chart/chart.component'
import { TweetComponent } from './tweet/tweet.component'
import { TweetsHttpsService } from './services/tweets-https.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { FiltersComponent } from './filters/filters.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { TopNPipe } from './pipes/top-n.pipe';

@NgModule({
  declarations: [
    AnalyzeContainerComponent,
    ChartComponent,
    TweetComponent,
    FiltersComponent,
    TopNPipe
  ],
  imports: [
    CommonModule,
    MatListModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  exports: [
    AnalyzeContainerComponent
  ],
  providers: [TweetsHttpsService]
})
export class AnalyzeModule { }
