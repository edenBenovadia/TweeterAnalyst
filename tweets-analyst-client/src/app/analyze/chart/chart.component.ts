import { Component, OnInit } from '@angular/core';
import { Aggregations, TimeRange } from '..';
import { AnalyzeStore } from '../services/analyze.store';
import { TweetsHttpsService } from '../services/tweets-https.service';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements OnInit {
  public tweets: any[] = [];

  constructor(private readonly analyzeStore: AnalyzeStore) { 
  }

  ngOnInit(): void {
    this.analyzeStore.tweets$.subscribe(t => console.log(t));
    this.analyzeStore.volumes$.subscribe(t => console.log(t));
  }

  view: any[] = [600, 300];

  // options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = false;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = 'time';
  yAxisLabel: string = 'value';
  timeline: boolean = true;

  colorScheme = {
    domain: ['#45c3c8'],
  };

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
