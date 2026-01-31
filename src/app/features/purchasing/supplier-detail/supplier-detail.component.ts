import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SuppliersService } from '../../../core/services/suppliers.service';

/** Validates international phone numbers (US, European, etc.): digits, +, spaces, hyphens, parentheses, dots; 8–15 digits. */
function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').trim();
  if (!v) return null; // required is handled separately
  const digitsOnly = v.replaceAll(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return { phoneNumber: true };
  if (!/^[\d\s\-+().]{8,25}$/.test(v)) return { phoneNumber: true };
  return null;
}

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule
  ],
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit {
  supplierForm: FormGroup;
  supplierId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private suppliersService: SuppliersService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required]],
      contactName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''], // kept for compatibility (template/control name); primary field is phoneNumber
      phoneNumber: ['', [Validators.required, phoneNumberValidator]],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.supplierId && this.supplierId !== 'new';

    if (this.isEditMode && this.supplierId) {
      this.loadSupplier(this.supplierId);
    }
  }

  loadSupplier(id: string): void {
    this.loading = true;
    this.suppliersService.getById(id).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue({
          name: supplier.name,
          contactName: supplier.contactName ?? supplier.name ?? '',
          email: supplier.email,
          phone: supplier.phone ?? supplier.phoneNumber ?? '',
          phoneNumber: supplier.phoneNumber ?? supplier.phone ?? '',
          address: supplier.address ?? ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load supplier: ' + (err?.message ?? 'Unknown error'));
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.supplierForm.valid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const formValue = this.supplierForm.value;
    const data = {
      name: formValue.name,
      contactName: formValue.contactName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      address: formValue.address || undefined
    };

    const observable = this.isEditMode && this.supplierId
      ? this.suppliersService.update(this.supplierId, data)
      : this.suppliersService.create(data);

    observable.subscribe({
      next: () => {
        this.message.success(`Supplier ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/purchasing/suppliers']);
      },
      error: (err) => {
        this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} supplier: ` + (err?.message ?? 'Unknown error'));
        // Defer reset so it runs after current CD cycle (avoids NG0100 when API fails in same turn)
        queueMicrotask(() => {
          this.saving = false;
          this.cdr.markForCheck();
        });
      }
    });
  }
}
