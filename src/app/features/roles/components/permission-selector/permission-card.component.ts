import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { Permission } from '../../../../types/api.types';

@Component({
  selector: 'app-permission-card',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzBadgeModule
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
