import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GiftWinnerReportModel } from '../../models/Report/GiftWinnerReportModel';
import { RevenueSummaryModel } from '../../models/Report/RevenueSummaryModel';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getWinners(): Observable<GiftWinnerReportModel[]> {
    return this.http.get<GiftWinnerReportModel[]>(`${this.baseUrl}/winners`);
  }

  getRevenueSummary(): Observable<RevenueSummaryModel> {
    return this.http.get<RevenueSummaryModel>(`${this.baseUrl}/revenue-summary`);
  }
}
