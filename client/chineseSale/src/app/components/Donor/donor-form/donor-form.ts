import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DonorService } from '../../../services/Donor/donor-service';
import { DonorModel } from '../../../models/Donor/DonorModel';
import { UniqDonorIdentity, UniqDonorName, UniqDonorEmail } from '../../../shared/uniq-donor.validator';

@Component({
  selector: 'app-donor-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donor-form.html',
  styleUrls: ['./donor-form.scss'],
})
export class DonorForm {
  donorForm!: FormGroup;
  @Input() donorToEdit?: DonorModel;
  @Output() close = new EventEmitter<void>();

  serverError = '';
  loading = true;
  saving = false;
  private allDonors: DonorModel[] = [];

  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  static emailPatternValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // let required handle empty
    return DonorForm.EMAIL_REGEX.test(control.value) ? null : { emailPattern: true };
  }

  constructor(private fb: FormBuilder, private donorService: DonorService) { }

  ngOnInit(): void {
    // Initialize form with basic validators first
    this.donorForm = this.fb.group({
      identityNumber: [this.donorToEdit?.identityNumber || '', [
        Validators.required,
        Validators.pattern(/^\d{9}$/)
      ]],
      name: [this.donorToEdit?.name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      phone: [this.donorToEdit?.phone || '', [
        Validators.required,
        Validators.pattern(/^05\d{8}$/)
      ]],
      email: [this.donorToEdit?.email || '', [
        Validators.required,
        DonorForm.emailPatternValidator
      ]]
    });

    // In edit mode, disable identityNumber (cannot change ID number)
    if (this.donorToEdit) {
      this.donorForm.get('identityNumber')?.disable();
    }

    // Load all donors for uniqueness validation
    this.donorService.getAll().subscribe({
      next: (donors) => {
        this.allDonors = donors;
        this.applyUniqValidators();
        this.loading = false;
      },
      error: () => {
        // Even if loading donors fails, allow the form to work (server will still validate)
        this.loading = false;
      }
    });
  }

  private applyUniqValidators(): void {
    const excludeId = this.donorToEdit?.id;

    // Identity number uniqueness — only in add mode
    if (!this.donorToEdit) {
      const idCtrl = this.donorForm.get('identityNumber')!;
      idCtrl.setValidators([
        Validators.required,
        Validators.pattern(/^\d{9}$/),
        UniqDonorIdentity(this.allDonors)
      ]);
      idCtrl.updateValueAndValidity();
    }

    // Name uniqueness
    const nameCtrl = this.donorForm.get('name')!;
    nameCtrl.setValidators([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      UniqDonorName(this.allDonors, excludeId)
    ]);
    nameCtrl.updateValueAndValidity();

    // Email uniqueness
    const emailCtrl = this.donorForm.get('email')!;
    emailCtrl.setValidators([
      Validators.required,
      DonorForm.emailPatternValidator,
      UniqDonorEmail(this.allDonors, excludeId)
    ]);
    emailCtrl.updateValueAndValidity();
  }

  save() {
    // Mark all fields as touched to show validation errors
    this.donorForm.markAllAsTouched();
    if (this.donorForm.invalid) return;

    this.serverError = '';
    this.saving = true;

    if (this.donorToEdit) {
      this.donorService.update(this.donorToEdit.id, this.donorForm.getRawValue()).subscribe({
        next: () => {
          this.saving = false;
          this.close.emit();
        },
        error: (err: any) => {
          this.saving = false;
          this.serverError = this.extractServerError(err, 'שגיאה בעדכון התורם');
        }
      });
    } else {
      this.donorService.add(this.donorForm.getRawValue()).subscribe({
        next: () => {
          this.saving = false;
          this.close.emit();
        },
        error: (err: any) => {
          this.saving = false;
          this.serverError = this.extractServerError(err, 'שגיאה בהוספת תורם');
        }
      });
    }
  }

  private extractServerError(err: any, fallback: string): string {
    // Handle structured error with message property
    if (err.error?.message) return err.error.message;

    // Handle plain string error body
    if (typeof err.error === 'string' && err.error.length < 200) return err.error;

    // Handle validation errors object from ASP.NET
    if (err.error?.errors) {
      const messages: string[] = [];
      for (const key of Object.keys(err.error.errors)) {
        messages.push(...err.error.errors[key]);
      }
      return messages.join(', ') || fallback;
    }

    // Handle 409 Conflict (duplicate)
    if (err.status === 409) return 'הנתונים כבר קיימים במערכת';

    return fallback;
  }
}
