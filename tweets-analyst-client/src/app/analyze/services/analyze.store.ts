import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import * as _ from "lodash";
import { catchError, concatMap, EMPTY, Observable, switchMap, tap } from "rxjs";
import { Aggregations, ChartEntities, Tweet, TimeRange, ChartEntity } from '../'
import { timeFormat, hash, roundByMinutes, twoDigits, roundBy30Minutes } from '../utils'
import { TweetsHttpsService } from "./tweets-https.service";

interface StocksSate {
    activeSymbol: string,
    tweets: Map<string, Tweet[]>,
    volumes: ChartEntities,
    aggregation: Aggregations,
    timeRange: TimeRange,
}

const emptySate: StocksSate = {
  activeSymbol: '',
  aggregation: Aggregations.NONE,
  timeRange: TimeRange.NONE,
  tweets: new Map<string, Tweet[]>(),
  volumes: {name: '', series: []},
}

@Injectable({
  providedIn: 'root'
})
export class AnalyzeStore extends ComponentStore<StocksSate> {
  
  constructor(
    private readonly tweetsHttpService: TweetsHttpsService,
  ) {
    super(emptySate);
  }

  readonly loadTweetsVolume = this.effect((payload$: Observable<any[]>) => {
    return payload$
    .pipe(
      concatMap(([symbol]) => {
        const from = this.getDateFromRangeFormatted(TimeRange.SEVENDAYS);
        const until = this.getDateFromRangeFormatted(TimeRange.NONE);
        this.setVolumeLoading(true);
        return this.tweetsHttpService.getVolumeForStock(symbol, from, until, Aggregations.NONE)
        .pipe(
          tap(volumes => {
            this.addVolume(volumes);
            this.setVolumeLoading(false);
          }),
          catchError(() => {
            this.setVolumeLoading(false);
            return EMPTY;
          }),
        );
      })
    );
  });
  
  readonly loadTweetsInRange = this.effect((payload$: Observable<any[]>) => {
    return payload$.pipe(
      switchMap(([symbol, range]) => {
        const from = this.getDateFromRange(range);
        const until = this.getDateFromRange(TimeRange.NONE);
        return this.tweetsHttpService.getTweetsByStock(symbol, from, until)
        .pipe(
          tap(tweets => {
            this.addTweets(tweets);
          }),
          catchError(() => EMPTY),
        );
      })
    );
  });

  readonly changeSymbol = this.effect((symbol$: Observable<string>) => {
    return symbol$.pipe(
      tap((symbol: string) => 
        this.addActiveSymbol(symbol)
      )
    );
  });

  readonly changeAggregation = this.effect((aggregation$: Observable<Aggregations>) => {
    return aggregation$.pipe(
      tap((aggregation: Aggregations) => 
        this.addAggregation(aggregation)
      )
    );
  });

  readonly changeTimeRange = this.effect((timeRange$: Observable<TimeRange>) => {
    return timeRange$.pipe(
      tap((timeRange: TimeRange) => 
        this.addtimeRange(timeRange)
      )
    );
  });
  
  readonly addTweets = this.updater((state, tweets: Tweet[]) => {
    const symbol: string | undefined = tweets.find(t => !!t.symbol)?.symbol;
    const tweetsMap = state.tweets;
    if (!symbol) {
      return state;
    }

    tweetsMap.set(symbol, tweets);
    return {
      ...state,
      tweets: tweetsMap,
    }
  });

  readonly addVolume = this.updater((state, volumes: ChartEntities) => {
    return {
      ...state,
      volumes: volumes,
    }
  });

  readonly addAggregation = this.updater((state, aggregation: Aggregations) => ({
    ...state,
    aggregation,
  }));

  readonly setVolumeLoading = this.updater((state, loading: boolean) => {
    state.volumes.loading = loading;
    
    return {
      ...state
    };
  });
  
  readonly addtimeRange = this.updater((state, timeRange: TimeRange) => ({
    ...state,
    timeRange,
  }));
  
  readonly addActiveSymbol = this.updater((state, activeSymbol: string) => ({
    ...state,
    activeSymbol,
  }));

  readonly aggregation$ = this.select(state => state.aggregation);
  
  readonly timeRange$ = this.select(state => state.timeRange);
  
  readonly activeSymbol$ = this.select(state => state.activeSymbol);
  
  readonly isVolumeLoading$ = this.select(state => state.volumes.loading);

  readonly volumes$ = this.select(state => {
    if (_.isEmpty(state.volumes.series) && !state.volumes.loading) {
      this.loadTweetsVolume([state.activeSymbol]);
    }

    return this.aggregate(state.aggregation, state.timeRange, state.volumes) || <ChartEntities> { name: '', series: [] };
  });

  readonly tweets$ = this.select(state => {
    if (!state.tweets.has(state.activeSymbol)) {
      this.loadTweetsInRange([state.activeSymbol, state.timeRange]);
    }

    return state.tweets.get(state.activeSymbol) || [];
  });

  /**
   * @param date 
   * @returns the date in respect with the Range YYYY-MM-DD
   */
  private getDateFromRange(range: TimeRange): string {
    let date = new Date(Date.now());
    switch(range) {
      case TimeRange.SEVENDAYS:
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
      case TimeRange.THREEDAYS:
        date.setDate(date.getDate() - 3);
        return date.toISOString().split('T')[0];
      case TimeRange.ONEDAY:
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
      default:
        return date.toISOString().split('T')[0];
    }
  }


  private getTimeFromRange(range: TimeRange): any {
    let date = new Date(Date.now());
    switch(range) {
      case TimeRange.SEVENDAYS:
        date.setDate(date.getDate() - 7);
        return date.getTime();
      case TimeRange.THREEDAYS:
        date.setDate(date.getDate() - 3);
        return date.getTime();
      case TimeRange.ONEDAY:
        date.setDate(date.getDate() - 1);
        return date.getTime();
      default:
        return date.getTime();
    }
  }

  /**
   * @param date 
   * @returns the date in respect with the Range yyyy:mm:dd:HH:MM:SS
   */
    private getDateFromRangeFormatted(range: TimeRange): string {
      let date = new Date(Date.now());
      if (range === TimeRange.NONE) {
        return timeFormat(date);
      }
      date.setDate(date.getDate() - 7);
      return timeFormat(date);
    }

    private aggregate(aggregation: Aggregations, timeRange: TimeRange, data: ChartEntities | undefined): ChartEntities {
      if (data == undefined) {
        return {name: '', series: []};
      }

      const series = data.series.filter(item => new Date(item.time).getTime() >=  this.getTimeFromRange(timeRange));
      const aggregated = new Map<string, number>();
      switch(aggregation) {
        case Aggregations.FIVEMIN:
          series.forEach(i => {
            const time = new Date(i.time);
            const value = i.value;
        
            const key = time.getFullYear().toString()
                        .concat(
                            '-' + twoDigits(time.getMonth()).toString()
                                .concat(
                                    '-' + twoDigits(time.getDay()).toString()
                                        .concat(
                                            'T' + twoDigits(time.getHours()).toString()
                                        )
                                              .concat(
                                                  ':' + twoDigits(roundByMinutes(time.getMinutes(), 5, 3))
                                              )
                                )
                        );
        
            aggregated.set(key, (aggregated.get(key) || 0) + value)
        });
        break;

        case Aggregations.Min:
          series.forEach(i => {
            const time = new Date(i.time);
            const value = i.value;
        
            const key = time.getFullYear().toString()
                        .concat(
                            '-' + twoDigits(time.getMonth()).toString()
                                .concat(
                                    '-' + twoDigits(time.getDay()).toString()
                                        .concat(
                                            'T' + twoDigits(time.getHours()).toString()
                                        )
                                              .concat(
                                                  ':' + twoDigits(roundByMinutes(time.getMinutes(), 1, 0.5))
                                              )
                                )
                        );
        
            aggregated.set(key, (aggregated.get(key) || 0) + value)
        });
        break;

        case Aggregations.THIRTYMIN:
          series.forEach(i => {
            const time = new Date(i.time);
            const value = i.value;
            
            roundBy30Minutes(time); //mutable function
            const key = time.getFullYear().toString()
                        .concat(
                            '-' + twoDigits(time.getMonth()).toString()
                                .concat(
                                    '-' + twoDigits(time.getDay()).toString()
                                        .concat(
                                            'T' + twoDigits(time.getHours()).toString()
                                        )
                                              .concat(
                                                  ':' + twoDigits(time.getMinutes())
                                              )
                                )
                        );
        
            aggregated.set(key, (aggregated.get(key) || 0) + value)
          });
          break;
    }
      

      const result: ChartEntity[] = []
      for (const key of aggregated.keys()) {
          const timeSplited: number[] = key.split(/[- :T]/).map(t => Number.parseInt(t));
          result.push(<ChartEntity>{
              time: new Date(timeSplited[0], timeSplited[1], timeSplited[2], timeSplited[3], timeSplited[4], 0).toISOString(),
              value: aggregated.get(key),
          });
      }

      return {name: '', series: result};
    }
}