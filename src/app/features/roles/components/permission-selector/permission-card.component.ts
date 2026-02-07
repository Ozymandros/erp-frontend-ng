import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { Permission } from '../../../../types/api.types';
import { AppButtonComponent } from '../../../../shared/components';

@Component({
  selector: 'app-permission-card',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzBadgeModule,
    AppButtonComponent
  ],
  templateUrl: './permission-card.component.html',
  styleUrls: ['./permission-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionCardComponent {
  @Input() permission!: Permission;
  @Input() isAssigned = false;
  @Input() saving = false;
  @Input() readonly = false;
  
  @Output() assign = new EventEmitter<Permission>();
  @Output() unassign = new EventEmitter<Permission>();

  constructor(private readonly cdr: ChangeDetectorRef) {}

  onAssign(): void {
    if (!this.readonly && !this.saving) {
      this.assign.emit(this.permission);
    }
  }

  onUnassign(): void {
    if (!this.readonly && !this.saving) {
      this.unassign.emit(this.permission);
    }
  }
}
