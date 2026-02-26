import { Injectable } from '@angular/core';
import { PurchaserDetailsModel } from '../../models/Cart/PurchaserDetailsModel';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CartItemModel } from '../../models/Cart/CartItemModel';
import { Observable } from 'rxjs';
import { AddToCartModel } from '../../models/Cart/AddToCartModel';
import { GiftPurchasesSummaryModel } from '../../models/Cart/GiftPurchasesSummaryModel';
import { TopGiftStatsModel } from '../../models/Cart/TopGiftStatsModel';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/Cart`;

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<CartItemModel[]> {
    return this.http.get<CartItemModel[]>(this.apiUrl);
  }

  add(dto: AddToCartModel): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  updateQuantity(cartId: number, newQuantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cartId}`, newQuantity);
  }

  remove(cartId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartId}`);
  }

  purchase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, {});
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`);
  }

  // --- Manager endpoints ---

  getPurchasesByGift(giftId: number): Observable<GiftPurchasesSummaryModel> {
    return this.http.get<GiftPurchasesSummaryModel>(`${this.apiUrl}/purchases/${giftId}`);
  }

  getAllPurchasers(): Observable<PurchaserDetailsModel[]> {
    return this.http.get<PurchaserDetailsModel[]>(`${this.apiUrl}/admin/purchasers`);
  }

  getPurchaserDetails(userId: number): Observable<PurchaserDetailsModel> {
    return this.http.get<PurchaserDetailsModel>(`${this.apiUrl}/admin/purchaser/${userId}`);
  }

  getTopGift(criteria?: string): Observable<TopGiftStatsModel> {
    let params = new HttpParams();
    if (criteria) params = params.append('criteria', criteria);
    return this.http.get<TopGiftStatsModel>(`${this.apiUrl}/admin/top-gift`, { params });
  }
}
