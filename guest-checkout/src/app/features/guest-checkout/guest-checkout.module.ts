import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GuestCheckoutComponent } from './guest-checkout.component';
import { GuestCheckoutRoutingModule } from './guest-checkout-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GuestCheckoutRoutingModule,
    GuestCheckoutComponent
  ]
})
export class GuestCheckoutModule { } 