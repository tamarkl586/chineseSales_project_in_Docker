import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DonorModel } from '../models/Donor/DonorModel';

export function UniqDonorIdentity(donorList: DonorModel[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const exists = donorList.find(d => d.identityNumber === control.value);
    return exists ? { existIdentity: 'ת.ז כבר קיימת במערכת' } : null;
  };
}

export function UniqDonorName(donorList: DonorModel[], excludeId?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const exists = donorList.find(
      d => d.name.trim().toLowerCase() === control.value.trim().toLowerCase() && d.id !== excludeId
    );
    return exists ? { existName: 'שם תורם כבר קיים במערכת' } : null;
  };
}

export function UniqDonorEmail(donorList: DonorModel[], excludeId?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const exists = donorList.find(
      d => d.email?.trim().toLowerCase() === control.value.trim().toLowerCase() && d.id !== excludeId
    );
    return exists ? { existEmail: 'אימייל כבר קיים במערכת' } : null;
  };
}
