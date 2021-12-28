import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import * as _ from "lodash";
import { catchError, combineLatest, EMPTY, Observable, switchMap, tap, filter, distinctUntilChanged, distinctUntilKeyChanged, skipWhile } from "rxjs";
import { Aggregations, ChartEntities, Tweet, TimeRange } from '../'
import { timeFormat, hash } from '../utils'
import { TweetsHttpsService } from "./tweets-https.service";

interface StocksSate {
    activeSymbol: string,
    tweets: Map<string, Tweet[]>,
    volumes: Map<string, ChartEntities>,
    aggregation: Aggregations,
    timeRange: TimeRange,
}

const emptySate: StocksSate = {
  activeSymbol: '',
  aggregation: Aggregations.NONE,
  timeRange: TimeRange.NONE,
  tweets: new Map<string, Tweet[]>(),
  volumes: new Map<string, ChartEntities>(),
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
      switchMap(([symbol, range, aggregation]) => {
        const from = this.getDateFromRangeFormatted(range);
        const until = this.getDateFromRangeFormatted(TimeRange.NONE);
        return this.tweetsHttpService.getVolumeForStock(symbol, from, until, aggregation)
        .pipe(
          tap(volumes => {
            this.addVolume({volumes, symbol, timeRange: range, aggregation: aggregation});
          }),
          catchError(() => EMPTY),
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

  readonly addVolume = this.updater((state, payload: {volumes: ChartEntities, symbol: string, timeRange: TimeRange, aggregation: Aggregations}) => {
    const { volumes, symbol, timeRange, aggregation } = payload;
    const key = hash(symbol + '_' + timeRange + '_' + aggregation);
    const volumesMap = state.volumes;

    volumesMap.set(key, volumes);
    return {
      ...state,
      volumes: volumesMap,
    }
  });

  readonly addAggregation = this.updater((state, aggregation: Aggregations) => ({
    ...state,
    aggregation,
  }));
  
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

  readonly volumes$ = this.select(state => {
    const key = hash(state.activeSymbol + '_' + state.timeRange + '_' + state.aggregation);
    if (!state.volumes.has(key)) {
      this.loadTweetsVolume([state.activeSymbol, state.timeRange, state.aggregation]);
    }

    return state.volumes.get(key) || <ChartEntities> { name: '', series: [] };
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

  /**
   * @param date 
   * @returns the date in respect with the Range yyyy:mm:dd:HH:MM:SS
   */
     private getDateFromRangeFormatted(range: TimeRange): string {
      let date = new Date(Date.now());
      switch(range) {
        case TimeRange.SEVENDAYS:
          date.setDate(date.getDate() - 7);
          return timeFormat(date);
        case TimeRange.THREEDAYS:
          date.setDate(date.getDate() - 3);
          return timeFormat(date);
        case TimeRange.ONEDAY:
          date.setDate(date.getDate() - 1);
          return timeFormat(date);
        default:
          return timeFormat(date);
      }
    }
}