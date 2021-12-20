import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyzeContainerComponent } from './analyze/analyze-container/analyze-container.component';

const routes: Routes = [
  { path: 'analyze', component: AnalyzeContainerComponent },
  { path: '**', redirectTo: 'analyze' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
