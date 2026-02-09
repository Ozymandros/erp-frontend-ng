import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '../../../../core/services/users.service';
import { RolesService } from '../../../../core/services/roles.service';
import { Role } from '../../../../types/api.types';
import { AppButtonComponent, AppInputComponent } from '../../../../shared/components';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzSpaceModule,
    NzBadgeModule,
    NzSpinModule,
    NzTooltipModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Input() initialRoles: Role[] = [];
  @Input() readonly = false;
  @Output() rolesChange = new EventEmitter<Role[]>();

  private static readonly SEARCH_MIN_LENGTH = 3;
  private static readonly SEARCH_DEBOUNCE_MS = 300;

  allRoles: Role[] = [];
  assignedRoles: Set<string> = new Set();
  searchTerm = '';
  /** Effective search term used for filtering (debounced, min 3 chars). */
  effectiveSearchTerm = '';
  loading = false;
  saving = false;
  error: string | null = null;
  private readonly searchTerm$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assignedRoles = new Set(this.initialRoles.map(r => r.id));
    this.loadRoles();
    this.searchTerm$
      .pipe(
        debounceTime(RoleSelectorComponent.SEARCH_DEBOUNCE_MS),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        const t = (term || '').trim();
        this.effectiveSearchTerm = t.length >= RoleSelectorComponent.SEARCH_MIN_LENGTH ? t : '';
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchTerm$.next(this.searchTerm);
  }

  loadRoles(): void {
    this.loading = true;
    this.error = null;
    
    this.rolesService.getAll({ pageSize: 100 }).subscribe({
      next: (response) => {
        this.allRoles = response.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load roles: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.message.error(this.error);
      }
    });
  }

  assignRole(role: Role): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.usersService.assignRole(this.userId, role.name).subscribe({
      next: () => {
        this.assignedRoles.add(role.id);
        this.emitRolesChange();
        this.message.success(`Role "${role.name}" assigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to assign role "${role.name}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  unassignRole(role: Role): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.usersService.removeRole(this.userId, role.name).subscribe({
      next: () => {
        this.assignedRoles.delete(role.id);
        this.emitRolesChange();
        this.message.success(`Role "${role.name}" unassigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to unassign role "${role.name}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  isAssigned(roleId: string): boolean {
    return this.assignedRoles?.has(roleId) || false;
  }

  get filteredRoles(): Role[] {
    if (!this.effectiveSearchTerm.trim()) {
      return this.allRoles || [];
    }
    const term = this.effectiveSearchTerm.toLowerCase();
    return this.allRoles?.filter((role: Role) =>
      role.name.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term)
    ) || [];
  }

  get assignedCount(): number {
    return this.assignedRoles?.size || 0;
  }

  get totalCount(): number {
    return this.allRoles?.length || 0;
  }

  private emitRolesChange(): void {
    const roles = this.allRoles?.filter(r => this.assignedRoles?.has(r.id)) || [];
    this.rolesChange.emit(roles);
  }
}
