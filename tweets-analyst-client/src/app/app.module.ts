import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnalyzeModule } from './analyze/analyze.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
  ],
  imports: [
    BrowserModule,
    AnalyzeModule,
    AppRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts' as 'echarts')
  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
