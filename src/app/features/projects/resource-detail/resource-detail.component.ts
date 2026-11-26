import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { ProjectResourcesService } from '../../../core/services/project-resources.service';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import {
  CreateUpdateResourceDto,
  ResourceGroupDto,
  ResourceType,
} from '../../../types/projects.types';
import { AppButtonComponent, AppInputComponent, AppInputNumberComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { RESOURCE_TYPE_OPTIONS } from '../projects.constants';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzSelectModule,
    NzCheckboxModule,
    AppButtonComponent,
    AppInputComponent,
    AppInputNumberComponent,
  ],
  templateUrl: './resource-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceDetailComponent implements OnInit {
  readonly paths = APP_PATHS.PROJECTS;
  readonly typeOptions = RESOURCE_TYPE_OPTIONS;
  form: FormGroup;
  resourceId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  groups: ResourceGroupDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly resourcesService: ProjectResourcesService,
    private readonly groupsService: ProjectResourceGroupsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      resourceNo: ['', Validators.required],
      name: ['', Validators.required],
      type: [ResourceType.Person],
      resourceGroupId: [null as string | null],
      baseUnitOfMeasure: ['HOUR', Validators.required],
      unitCost: [0],
      unitPrice: [0],
      dailyCapacity: [8],
      blocked: [false],
    });
  }

  ngOnInit(): void {
    this.resourceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.resourceId && this.resourceId !== 'new';
    this.groupsService.list().subscribe({
      next: (g) => {
        this.groups = g;
        this.cdr.markForCheck();
      },
    });
    if (this.isEditMode && this.resourceId) {
      this.load(this.resourceId);
    }
  }

  load(id: string): void {
    this.loading = true;
    this.resourcesService
      .getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (r) => {
          this.form.patchValue({
            resourceNo: r.resourceNo,
            name: r.name,
            type: this.typeOptions.find((o) => o.label === r.type)?.value ?? ResourceType.Person,
            resourceGroupId: r.resourceGroupId,
            baseUnitOfMeasure: r.baseUnitOfMeasure,
            unitCost: r.unitCost,
            unitPrice: r.unitPrice,
            dailyCapacity: r.dailyCapacity,
            blocked: r.blocked,
          });
        },
        error: () => this.message.error('Failed to load resource'),
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const dto = this.form.value as CreateUpdateResourceDto;
    const req =
      this.isEditMode && this.resourceId
        ? this.resourcesService.update(this.resourceId, dto)
        : this.resourcesService.create(dto);
    req
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (r) => {
          this.message.success('Resource saved');
          this.router.navigate([this.paths.RESOURCE_DETAIL(r.id)]);
        },
        error: () => this.message.error('Failed to save resource'),
      });
  }
}
