import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { finalize } from 'rxjs/operators';
import { CrmContactsService } from '../../../core/services/crm-contacts.service';
import { ContactDto } from '../../../types/crm.types';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

const PHONE_INPUT_MAX_LENGTH = 25;

function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').trim();
  if (!v) return null;
  if (v.length > PHONE_INPUT_MAX_LENGTH) return { phoneNumber: true };
  const digitsOnly = v.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return { phoneNumber: true };
  if (!/^[\d\s\-+().]{8,25}$/.test(v)) return { phoneNumber: true };
  return null;
}

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzGridModule,
    NzSpinModule,
    NzCheckboxModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.css'],
})
export class ContactDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactsService = inject(CrmContactsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly paths = APP_PATHS.CRM;

  form: FormGroup;
  contactId: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  contact: ContactDto | null = null;

  constructor() {
    this.form = this.fb.group({
      accountId: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [phoneNumberValidator]],
      title: [''],
      isPrimary: [false],
    });
  }

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = !this.contactId;

    const qAccount = this.route.snapshot.queryParamMap.get('accountId');
    if (this.isNewMode && qAccount) {
      this.form.patchValue({ accountId: qAccount });
    }

    if (!this.isNewMode && this.contactId) {
      this.loadContact(this.contactId);
    }
  }

  loadContact(id: string): void {
    this.loading = true;
    this.contactsService
      .getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (c) => {
          this.contact = c;
          this.form.patchValue({
            accountId: c.accountId,
            fullName: c.fullName,
            email: c.email ?? '',
            phone: c.phone ?? '',
            title: c.title ?? '',
            isPrimary: c.isPrimary,
          });
          this.form.get('accountId')?.disable();
        },
        error: (err) => this.message.error('Failed to load contact: ' + (err?.message ?? err)),
      });
  }

  save(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const v = this.form.getRawValue();
    this.saving = true;

    if (this.isNewMode) {
      this.contactsService
        .create({
          accountId: v.accountId,
          fullName: v.fullName,
          email: v.email || null,
          phone: v.phone || null,
          title: v.title || null,
          isPrimary: !!v.isPrimary,
        })
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (created) => {
            this.message.success('Contact created');
            void this.router.navigate([this.paths.CONTACT_DETAIL(created.id)]);
          },
          error: (err) => this.message.error(err?.message ?? 'Create failed'),
        });
    } else if (this.contactId) {
      this.contactsService
        .update(this.contactId, {
          fullName: v.fullName,
          email: v.email || null,
          phone: v.phone || null,
          title: v.title || null,
        })
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            this.message.success('Contact updated');
            void this.router.navigate([this.paths.CONTACTS]);
          },
          error: (err) => this.message.error(err?.message ?? 'Update failed'),
        });
    }
  }
}
