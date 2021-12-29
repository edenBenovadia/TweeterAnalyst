import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { transformToCharts } from '../utils';
import { Aggregations, ChartEntities, Tweet } from '..';

const GetTweetsURL = 'http://127.0.0.1:3000'
const GetVolumeURL = 'http://mars.larium.ai:8003/tweets/get_pulse_by_ticker'

@Injectable({
  providedIn: 'root'
})
export class TweetsHttpsService {

  constructor(private http: HttpClient) { 
  }

  public getTweetsByStock(ticker: string, from: string, until: string): Observable<Tweet[]> {
    const uri = GetTweetsURL;
    let params = new HttpParams();
    params = params.append('ticker', ticker);
    params = params.append('from_date', from);
    params = params.append('until_date', until);

    return this.http.get<any[]>(uri, {params})
    .pipe(
      map((result: any[]) => {
        return result
        .map((tweet: any) => (<Tweet>{
              tweetId: tweet.tweet_id,
              creationDate: tweet.tweet_created_at,
              likes: tweet.likes,
              quotes: tweet.quotes,
              replies: tweet.replies,
              retweets: tweet.retweets,
              text: tweet.text,
              username: tweet.username,
              symbol: ticker,
          }))
      })
    );
  }

  public getVolumeForStock(ticker: string, from: string, until: string, aggregation: Aggregations): Observable<ChartEntities> {
    const uri = GetVolumeURL;
    let params = new HttpParams();
    params = params.append('ticker', ticker);
    params = params.append('from_datetime', from);
    params = params.append('until_datetime', until);
    if (aggregation !== Aggregations.NONE) {
      params = params.append('agg_mode', aggregation);
    }

    return this.http.get<any[]>(uri, {params})
    .pipe(
      map((result: any[]) => {
        return transformToCharts(result);
      })
    );
  }
}
