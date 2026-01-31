import { Directive, Input, TemplateRef, ViewContainerRef, OnChanges, SimpleChanges } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnChanges {
  @Input() appHasPermission?: { module: string; action: string };

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    // Always clear the view container first to prevent duplicate views
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
