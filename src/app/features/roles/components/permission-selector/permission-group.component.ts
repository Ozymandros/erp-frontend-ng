import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Permission } from '../../../../types/api.types';
import { PermissionCardComponent } from './permission-card.component';

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-permission-group',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    PermissionCardComponent
  ],
  templateUrl: './permission-group.component.html',
  styleUrls: ['./permission-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionGroupComponent implements OnChanges {
  @Input() group!: PermissionGroup;
  @Input() assignedPermissionIds!: Set<string>; // Group component manages assignment state for its permissions
  @Input() savingPermissionId: string | null = null; // Track which specific permission is being saved
  @Input() savingModule: string | null = null; // Track which module is being saved (for selectAll/deselectAll)
  @Input() readonly = false;
  
  @Output() assign = new EventEmitter<Permission>();
  @Output() unassign = new EventEmitter<Permission>();
  @Output() selectAll = new EventEmitter<string>();
  @Output() deselectAll = new EventEmitter<string>();

  private _isSaving = false; // Cache the saving state to avoid re-renders
  private _isDetached = false; // Track if component is detached from change detection

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Reattach when group changes (for initial render or structural changes)
    if (changes['group']) {
      if (this._isDetached) {
        this.cdr.reattach();
        this._isDetached = false;
      }
      return; // Group change always requires full update
    }
    
    // Handle assignedPermissionIds reference changes (though Set mutations won't trigger this)
    // When parent marks for check, we need to ensure cards can update BUT NOT the header
    // Note: This block is kept for completeness, but Set mutations don't trigger ngOnChanges
    // Cards will update independently when their inputs change via Zone.js
    if (changes['assignedPermissionIds']) {
      // Don't detach here - let cards update naturally
      // Header doesn't need to re-render when assignment state changes
      return;
    }
    
    // Only update if savingPermissionId or savingModule changed AND it's relevant to this group
    if (changes['savingPermissionId'] || changes['savingModule']) {
      const wasSaving = this._isSaving;
      this._isSaving = this.calculateIsSaving();
      
      // Only trigger change detection if the saving state actually changed for this group
      if (wasSaving !== this._isSaving) {
        // Only update header if savingModule changed (SelectAll/DeselectAll)
        // For savingPermissionId changes (single card), header doesn't need to update
        // because the loading state is handled by individual cards
        if (changes['savingModule']) {
          // Mark for check to update header loading state for SelectAll/DeselectAll
          this.cdr.markForCheck();
        }
        // For savingPermissionId changes, don't mark for check - let cards update independently
      }
      // Always return early to prevent further processing when only saving state changed
      return;
    }
  }

  /**
   * Group component's responsibility: Check if a permission is assigned
   */
  isAssigned(permissionId: string): boolean {
    return this.assignedPermissionIds.has(permissionId);
  }

  /**
   * Group component's responsibility: Check if this group is currently saving
   * Returns true if:
   * 1. savingPermissionId belongs to this group's permissions (single card saving), OR
   * 2. savingModule matches this group's module (selectAll/deselectAll)
   */
  get isSaving(): boolean {
    return this._isSaving;
  }

  private calculateIsSaving(): boolean {
    if (this.savingModule === this.group.module) return true;
    if (!this.savingPermissionId) return false;
    return this.group.permissions.some(p => p.id === this.savingPermissionId);
  }

  /**
   * Group component's responsibility: Handle Select All action
   */
  onSelectAll(): void {
    // Prevent multiple clicks - check if already saving
    if (this.isSaving) return;
    this.selectAll.emit(this.group.module);
  }

  /**
   * Group component's responsibility: Handle Deselect All action
   */
  onDeselectAll(): void {
    // Prevent multiple clicks - check if already saving
    if (this.isSaving) return;
    this.deselectAll.emit(this.group.module);
  }
}
