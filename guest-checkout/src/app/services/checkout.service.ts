import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRecord } from '../features/guest-checkout/models/checkout.interface';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:3000/api/checkouts';

  constructor(private http: HttpClient) {}

  getCheckouts(): Observable<CheckoutRecord[]> {
    return this.http.get<CheckoutRecord[]>(this.apiUrl);
  }

  createCheckout(checkout: CheckoutRecord): Observable<CheckoutRecord> {
    return this.http.post<CheckoutRecord>(this.apiUrl, checkout);
  }

  updateCheckout(id: string, checkout: Partial<CheckoutRecord>): Observable<CheckoutRecord> {
    return this.http.patch<CheckoutRecord>(`${this.apiUrl}/${id}`, checkout);
  }
} 