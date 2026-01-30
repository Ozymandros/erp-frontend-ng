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
import { WarehousesService } from '../../../core/services/warehouses.service';
import { WarehouseDto } from '../../../types/api.types';

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
  templateUrl: './warehouse-detail.component.html',
  styleUrls: ['./warehouse-detail.component.css']
})
export class WarehouseDetailComponent implements OnInit {
  warehouseForm: FormGroup;
  warehouseId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private warehousesService: WarehousesService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required]],
      location: [''] 
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
    this.warehousesService.getById(id).subscribe({
      next: (warehouse) => {
        this.warehouseForm.patchValue({
          name: warehouse.name,
          location: warehouse.location
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
        ? this.warehousesService.update(this.warehouseId, data)
        : this.warehousesService.create(data);


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
