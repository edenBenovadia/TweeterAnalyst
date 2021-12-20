import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeContainerComponent } from './analyze-container/analyze-container.component'
import { ChartComponent} from './chart/chart.component'
import { SearchComponent } from './search/search.component';
import { TweetComponent } from './tweet/tweet.component'
import { TweetsHttpsService } from './services/tweets-https.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FiltersComponent } from './filters/filters.component';

@NgModule({
  declarations: [
    AnalyzeContainerComponent,
    SearchComponent,
    ChartComponent,
    TweetComponent,
    FiltersComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  exports: [
    AnalyzeContainerComponent
  ],
  providers: [TweetsHttpsService]
})
export class AnalyzeModule { }
