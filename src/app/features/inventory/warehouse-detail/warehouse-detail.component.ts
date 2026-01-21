import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InventoryService } from '@/app/core/services/inventory.service';
import { WarehouseDto } from '@/app/types/api.types';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSwitchModule
  ],
  template: `
    <div class="warehouse-detail">
      <div class="page-header" style="margin-bottom: 24px;">
        <button nz-button nzType="default" routerLink="/inventory/warehouses" style="margin-right: 16px;">
          <i nz-icon nzType="arrow-left"></i> Back
        </button>
        <h1>{{ isEditMode ? 'Edit Warehouse' : 'Create Warehouse' }}</h1>
      </div>

      <nz-card [nzLoading]="loading">
        <form nz-form [formGroup]="warehouseForm" (ngSubmit)="save()">
          <nz-form-item>
            <nz-form-label [nzSpan]="4" nzRequired>Warehouse Name</nz-form-label>
            <nz-form-control [nzSpan]="14" nzErrorTip="Please input warehouse name!">
              <input nz-input formControlName="name" placeholder="e.g. Main Warehouse" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="4">Location/Address</nz-form-label>
            <nz-form-control [nzSpan]="14">
              <input nz-input formControlName="location" placeholder="e.g. 123 Industrial Rd, City" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="4">Active Status</nz-form-label>
            <nz-form-control [nzSpan]="14">
              <nz-switch formControlName="isActive"></nz-switch>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzOffset]="4" [nzSpan]="14">
              <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!warehouseForm.valid">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
              <button nz-button nzType="default" type="button" routerLink="/inventory/warehouses" style="margin-left: 8px;">Cancel</button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    h1 {
      display: inline-block;
      margin: 0;
      vertical-align: middle;
    }
  `]
})
export class WarehouseDetailComponent implements OnInit {
  warehouseForm: FormGroup;
  warehouseId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required]],
      location: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.warehouseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.warehouseId && this.warehouseId !== 'new';
    
    if (this.isEditMode && this.warehouseId) {
      this.loadWarehouse(this.warehouseId);
    }
  }

  loadWarehouse(id: string): void {
    this.loading = true;
    this.inventoryService.getWarehouseById(id).subscribe({
      next: (warehouse) => {
        this.warehouseForm.patchValue({
          name: warehouse.name,
          location: warehouse.location,
          isActive: warehouse.isActive
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load warehouse');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.warehouseForm.valid) {
      this.saving = true;
      const data = this.warehouseForm.value;

      const obs = this.isEditMode && this.warehouseId
        ? this.inventoryService.updateWarehouse(this.warehouseId, data)
        : this.inventoryService.createWarehouse(data);

      obs.subscribe({
        next: () => {
          this.message.success(`Warehouse ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/inventory/warehouses']);
        },
        error: (err) => {
          this.message.error('Operation failed: ' + err.message);
          this.saving = false;
        }
      });
    }
  }
}
