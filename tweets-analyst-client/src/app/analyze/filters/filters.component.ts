import { Component, OnInit } from '@angular/core';
import { Aggregations, TimeRange } from '..';
import { AnalyzeStore } from '../services/analyze.store';

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.less']
})
export class FiltersComponent implements OnInit {
  public readonly sevenDay = TimeRange.SEVENDAYS;
  public readonly threeDay = TimeRange.THREEDAYS;
  public readonly oneDay = TimeRange.ONEDAY;

  public readonly ThirtyMinutes = Aggregations.THIRTYMIN;
  public readonly FiveMinutes = Aggregations.FIVEMIN;
  public readonly OneMinute = Aggregations.Min;

  constructor(private readonly analyzeStore: AnalyzeStore) { }

  ngOnInit(): void {
    this.analyzeStore.changeSymbol('AMZN');
    this.analyzeStore.changeAggregation(Aggregations.HOUR);
    this.analyzeStore.changeTimeRange(TimeRange.THREEDAYS);
    this.analyzeStore.loadTweetsInRange();
    this.analyzeStore.loadTweetsVolume();
  }

  chagneRange(range: TimeRange): void {
    this.analyzeStore.changeTimeRange(range);
  }
  
  changeAggregation(aggr: Aggregations): void {
    this.analyzeStore.changeAggregation(aggr);
  }
}
