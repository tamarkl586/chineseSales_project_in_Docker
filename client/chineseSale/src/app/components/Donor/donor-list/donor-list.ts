import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DonorModel } from '../../../models/Donor/DonorModel';
import { DonorService } from '../../../services/Donor/donor-service';
import { DonorForm } from '../donor-form/donor-form';
import { DonorDetails } from '../donor-details/donor-details';

@Component({
  selector: 'app-donor-list',
  imports: [FormsModule, DonorForm, DonorDetails],
  templateUrl: './donor-list.html',
  styleUrls: ['./donor-list.scss'],
})
export class DonorList {
  donors: DonorModel[] = [];
  allDonors: DonorModel[] = [];
  showForm = false;
  selectedDonor?: DonorModel;
  expandedDonor?: DonorModel;

  // Filter fields (pill-style like gift list)
  filterName = '';
  filterGift = '';
  filterEmail = '';

  // Unique values for filter dropdowns
  donorNames: string[] = [];
  giftNames: string[] = [];
  donorEmails: string[] = [];

  // Delete error message
  deleteError = '';

  // Summary stats
  totalGifts = 0;

  constructor(private donorService: DonorService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.showForm = false;
    this.selectedDonor = undefined;
    this.donorService.getAll().subscribe(res => {
      this.donors = res;
      this.allDonors = res;
      this.donorNames = [...new Set(res.map(d => d.name))].sort();
      this.giftNames = [...new Set(res.flatMap(d => d.gifts?.map(g => g.name) || []))].sort();
      this.donorEmails = [...new Set(res.map(d => d.email).filter(e => !!e))].sort();
      this.totalGifts = res.reduce((sum, d) => sum + (d.gifts?.length || 0), 0);
    });
  }

  // Pill-style filtering (client-side)
  applyFilters() {
    if (!this.filterName && !this.filterGift && !this.filterEmail) {
      this.donors = this.allDonors;
      return;
    }
    let result = [...this.allDonors];
    if (this.filterName) {
      result = result.filter(d => d.name === this.filterName);
    }
    if (this.filterGift) {
      result = result.filter(d => d.gifts?.some(g => g.name === this.filterGift));
    }
    if (this.filterEmail) {
      result = result.filter(d => d.email === this.filterEmail);
    }
    this.donors = result;
  }

  clearFilters() {
    this.filterName = '';
    this.filterGift = '';
    this.filterEmail = '';
    this.donors = this.allDonors;
  }

  openAdd() {
    this.selectedDonor = undefined;
    this.showForm = true;
  }

  openEdit(donor: DonorModel) {
    this.selectedDonor = donor;
    this.showForm = true;
  }

  toggleDetails(donor: DonorModel) {
    this.expandedDonor = this.expandedDonor?.id === donor.id ? undefined : donor;
  }

  delete(id: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק את התורם?')) {
      this.deleteError = '';
      this.donorService.delete(id).subscribe({
        next: () => this.refresh(),
        error: (err: any) => {
          const msg = err.error?.message || 'שגיאה במחיקת התורם';
          this.deleteError = msg;
          setTimeout(() => this.deleteError = '', 5000);
        }
      });
    }
  }
}
