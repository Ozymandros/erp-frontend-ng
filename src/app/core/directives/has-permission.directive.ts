import { Directive, Input, TemplateRef, ViewContainerRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnChanges {
  @Input() appHasPermission?: { module: string; action: string };

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.applyPermission();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.applyPermission();
  }

  private applyPermission(): void {
    this.viewContainer.clear();

    if (!this.appHasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    const hasPermission = this.permissionService.hasPermission(
      this.appHasPermission.module,
      this.appHasPermission.action
    );

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
