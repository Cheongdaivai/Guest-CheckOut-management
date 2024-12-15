import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestCheckoutComponent } from './guest-checkout.component';

const routes: Routes = [
  {
    path: '',
    component: GuestCheckoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestCheckoutRoutingModule { } 