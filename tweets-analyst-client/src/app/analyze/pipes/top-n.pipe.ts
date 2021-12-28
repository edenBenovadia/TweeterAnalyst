import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { map, Observable } from 'rxjs';
import { Tweet } from '..';

@Pipe({
  name: 'topN'
})
export class TopNPipe implements PipeTransform {

  transform(tweets$: Observable<Tweet[]>, top: number): Observable<Tweet[]> {
    return tweets$
    .pipe(
      map(tweets => _(tweets).sortBy(['creationDate']).take(top).value())
    );
  }
}
