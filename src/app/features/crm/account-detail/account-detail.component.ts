import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { finalize } from 'rxjs/operators';
import { CrmAccountsService } from '../../../core/services/crm-accounts.service';
import { CrmContactsService } from '../../../core/services/crm-contacts.service';
import { AuthService } from '../../../core/services/auth.service';
import { AccountDto, ContactDto } from '../../../types/crm.types';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzGridModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
})
export class AccountDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly accountsService = inject(CrmAccountsService);
  private readonly contactsService = inject(CrmContactsService);
  private readonly route = inject(ActivatedRoute);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);

  readonly paths = APP_PATHS.CRM;

  account: AccountDto | null = null;
  contacts: ContactDto[] = [];
  loading = false;
  loadingContacts = false;
  savingOwner = false;
  settingPrimary: string | null = null;

  ownerForm: FormGroup;

  constructor() {
    this.ownerForm = this.fb.group({
      ownerUsername: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
    }
  }

  loadAccount(id: string): void {
    this.loading = true;
    this.accountsService
      .getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (a) => {
          this.account = a;
          this.ownerForm.patchValue({ ownerUsername: a.ownerUsername ?? '' });
          this.loadContacts(id);
        },
        error: (err) => this.message.error('Failed to load account: ' + (err?.message ?? err)),
      });
  }

  loadContacts(accountId: string): void {
    this.loadingContacts = true;
    this.contactsService
      .listByAccount(accountId)
      .pipe(finalize(() => (this.loadingContacts = false)))
      .subscribe({
        next: (rows) => (this.contacts = rows),
        error: () => this.message.error('Failed to load contacts'),
      });
  }

  saveOwner(): void {
    if (this.ownerForm.invalid || !this.account) return;
    this.savingOwner = true;
    const v = this.ownerForm.getRawValue();
    this.accountsService
      .updateOwner(this.account.id, { ownerUsername: v.ownerUsername })
      .pipe(finalize(() => (this.savingOwner = false)))
      .subscribe({
        next: (a) => {
          this.account = a;
          this.message.success('Owner updated');
        },
        error: (err) => this.message.error(err?.message ?? 'Update failed'),
      });
  }

  setPrimary(contact: ContactDto): void {
    if (!this.account) return;
    this.settingPrimary = contact.id;
    this.contactsService
      .setPrimary(this.account.id, contact.id)
      .pipe(finalize(() => (this.settingPrimary = null)))
      .subscribe({
        next: () => {
          this.message.success('Primary contact updated');
          this.loadContacts(this.account!.id);
        },
        error: (err) => this.message.error(err?.message ?? 'Failed'),
      });
  }

  canUpdateOwner(): boolean {
    const p = this.authService.getCurrentUser()?.permissions ?? [];
    return (
      this.authService.getCurrentUser()?.isAdmin ||
      p.some((x) => x.module.toLowerCase() === 'crm' && x.action.toLowerCase() === 'update')
    );
  }

}
