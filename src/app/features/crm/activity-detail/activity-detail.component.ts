import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs/operators';
import { CrmActivitiesService } from '../../../core/services/crm-activities.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityDto } from '../../../types/crm.types';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { CRM_ACTIVITY_TYPES } from '../crm.constants';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzGridModule,
    NzDatePickerModule,
    NzSelectModule,
    NzSpinModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.css'],
})
export class ActivityDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activitiesService = inject(CrmActivitiesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);

  readonly paths = APP_PATHS.CRM;
  readonly activityTypes = [...CRM_ACTIVITY_TYPES];

  form: FormGroup;
  completeNote = '';
  activityId: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  completing = false;
  activity: ActivityDto | null = null;

  dueDate: Date | null = null;

  constructor() {
    this.form = this.fb.group({
      subject: ['', [Validators.required]],
      type: [CRM_ACTIVITY_TYPES[0], [Validators.required]],
      assignedToUsername: ['', [Validators.required]],
      leadId: [''],
      opportunityId: [''],
      customerId: [''],
    });
  }

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = !this.activityId;

    const u = this.authService.getCurrentUser()?.username;
    if (this.isNewMode && u) {
      this.form.patchValue({ assignedToUsername: u });
    }

    if (!this.isNewMode && this.activityId) {
      this.loadActivity(this.activityId);
    }
  }

  loadActivity(id: string): void {
    this.loading = true;
    this.activitiesService
      .getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (a) => {
          this.activity = a;
          this.dueDate = a.dueAt ? new Date(a.dueAt) : null;
          this.form.patchValue({
            subject: a.subject,
            type: a.type,
            assignedToUsername: a.assignedToUsername,
            leadId: a.leadId ?? '',
            opportunityId: a.opportunityId ?? '',
            customerId: a.customerId ?? '',
          });
          this.form.disable();
        },
        error: (err) => this.message.error('Failed to load activity: ' + (err?.message ?? err)),
      });
  }

  save(): void {
    if (this.form.invalid || !this.dueDate) {
      if (!this.dueDate) {
        this.message.error('Due date is required');
      }
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const u = this.authService.getCurrentUser()?.username;
    if (!u) {
      this.message.error('Missing current user');
      return;
    }

    const v = this.form.getRawValue();
    const dueAt = this.dueDate.toISOString();

    this.saving = true;
    this.activitiesService
      .create({
        subject: v.subject,
        type: v.type,
        dueAt,
        assignedToUsername: v.assignedToUsername || u,
        leadId: v.leadId || null,
        opportunityId: v.opportunityId || null,
        customerId: v.customerId || null,
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (created) => {
          this.message.success('Activity created');
          void this.router.navigate([this.paths.ACTIVITY_DETAIL(created.id)]);
        },
        error: (err) => this.message.error(err?.message ?? 'Create failed'),
      });
  }

  complete(): void {
    if (!this.activityId) return;
    this.completing = true;
    this.activitiesService
      .complete(this.activityId, { note: this.completeNote || null })
      .pipe(finalize(() => (this.completing = false)))
      .subscribe({
        next: (a) => {
          this.message.success('Activity completed');
          this.activity = a;
          this.loadActivity(this.activityId!);
        },
        error: (err) => this.message.error(err?.message ?? 'Complete failed'),
      });
  }

  isCompleted(): boolean {
    const s = this.activity?.status?.toLowerCase() ?? '';
    return s.includes('complete') || !!this.activity?.completedAt;
  }
}
