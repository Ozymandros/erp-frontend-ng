import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
export class PermissionCardComponent implements OnChanges {
  @Input() permission!: Permission;
  @Input() isAssigned = false;
  @Input() saving = false;
  @Input() readonly = false;
  
  @Output() assign = new EventEmitter<Permission>();
  @Output() unassign = new EventEmitter<Permission>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-card.component.ts:ngOnChanges',message:'Card ngOnChanges',data:{permissionId:this.permission?.id,changedKeys:Object.keys(changes),isAssignedChanged:!!changes['isAssigned'],isAssignedValue:this.isAssigned,savingChanged:!!changes['saving'],savingValue:this.saving},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }

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
