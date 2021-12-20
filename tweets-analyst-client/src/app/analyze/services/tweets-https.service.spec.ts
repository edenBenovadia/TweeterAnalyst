import { TestBed } from '@angular/core/testing';

import { TweetsHttpsService } from './tweets-https.service';

describe('TweetsHttpsService', () => {
  let service: TweetsHttpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TweetsHttpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
