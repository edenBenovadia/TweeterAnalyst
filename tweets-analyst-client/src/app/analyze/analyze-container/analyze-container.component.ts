import { Component, OnInit } from '@angular/core';
import { TweetsHttpsService } from '../services/tweets-https.service';

@Component({
  selector: 'analyze-container',
  templateUrl: './analyze-container.component.html',
  styleUrls: ['./analyze-container.component.less']
})
export class AnalyzeContainerComponent implements OnInit {

  constructor(private readonly tweetsService: TweetsHttpsService) { }

  ngOnInit(): void {
  }

}
