import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-resource-group-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NzCardModule, AppButtonComponent, AppInputComponent],
  templateUrl: './resource-group-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceGroupDetailComponent implements OnInit {
  readonly paths = APP_PATHS.PROJECTS;
  form: FormGroup;
  groupId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly groupsService: ProjectResourceGroupsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.groupId && this.groupId !== 'new';
    if (this.isEditMode && this.groupId) {
      this.load(this.groupId);
    }
  }

  load(id: string): void {
    this.loading = true;
    this.groupsService
      .getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (g) => this.form.patchValue(g),
        error: () => this.message.error('Failed to load resource group'),
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const dto = this.form.value as { code: string; name: string };
    const req =
      this.isEditMode && this.groupId
        ? this.groupsService.update(this.groupId, dto)
        : this.groupsService.create(dto);
    req
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (g) => {
          this.message.success('Resource group saved');
          this.router.navigate([this.paths.RESOURCE_GROUP_DETAIL(g.id)]);
        },
        error: () => this.message.error('Failed to save resource group'),
      });
  }
}
