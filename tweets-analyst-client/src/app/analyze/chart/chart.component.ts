import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartEntities, ChartEntity, Tweet } from '..';
import { AnalyzeStore } from '../services/analyze.store';
import { Subject, takeUntil } from 'rxjs';
import * as _ from 'lodash';


@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
})
export class ChartComponent implements OnInit, OnDestroy {
  public tweets: Tweet[] = [];
  public echartInstance: any;
  public options: any;
  public updateOptions: any;
    
  private destroy$: Subject<void> = new Subject();

  constructor(
    private readonly analyzeStore: AnalyzeStore,
    private readonly cd: ChangeDetectorRef,
  ) { 
  }

  ngOnInit(): void {
    this.analyzeStore.volumes$
    .pipe(
      takeUntil(this.destroy$),
    ).subscribe((entities: ChartEntities) => {
      this.updateChart(entities);
    });   

    this.options = {
      xAxis: {
        silent: true,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          name: 'some name',
          type: 'line',
          animationDelay: (idx: any) => idx * 10 + 100,
        },
      ],
      legend: {
        data: [''],
        align: 'left',
      },
      tooltip: {},
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: any) => idx * 5,
    };
  }

  private updateChart(entities: ChartEntities) {
    const xAxisData: string[] = [];
    const data: string[] = []
    entities.series.forEach((t: ChartEntity) => {
      xAxisData.push(new Date(t.time).toDateString());
      data.push(t.value);
    });
    if (!this.echartInstance) {
      return;
    }

    this.echartInstance.setOption({
      series: [
        {
          name: 'bar',
          type: 'line',
          data: data,
        },
      ],
      xAxis: {
        data: xAxisData,
      },
      yAxis: {

      },
    }, {notMerge: true, replaceMerge: ['xAxis', 'series']});
  }

  public onChartInit(ec: any) {
    if (!ec)
      return;

    this.echartInstance = ec
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

}
