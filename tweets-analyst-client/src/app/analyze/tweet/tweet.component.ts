import { Component, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Tweet } from '..';
import { AnalyzeStore } from '../services/analyze.store';

@Component({
  selector: 'tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.less']
})
export class TweetComponent implements OnInit {

  private destroy$: Subject<void>  = new Subject();
  public tweets$: Observable<Tweet[]>;

  constructor(
    private readonly analyzeStore: AnalyzeStore
  ) { }

  ngOnInit(): void {
    // this.tweets$ = this.analyzeStore.tweets$;
  }

}
