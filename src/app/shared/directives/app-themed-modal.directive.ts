import { Directive, OnInit, inject } from '@angular/core';
import { NzModalComponent } from 'ng-zorro-antd/modal';
import { APP_MODAL_CLASS, APP_MODAL_WRAP_CLASS, mergeAppModalClasses } from '../constants/app-modal.constants';

/**
 * Adds app modal CSS hooks to {@link NzModalComponent} for theme-aligned styling.
 *
 * @example
 * ```html
 * <nz-modal appThemedModal [(nzVisible)]="visible" nzTitle="Title">...</nz-modal>
 * ```
 */
@Directive({
  selector: 'nz-modal[appThemedModal]',
  standalone: true,
})
export class AppThemedModalDirective implements OnInit {
  private readonly modal = inject(NzModalComponent);

  ngOnInit(): void {
    this.modal.nzWrapClassName = mergeAppModalClasses(APP_MODAL_WRAP_CLASS, this.modal.nzWrapClassName);
    this.modal.nzClassName = mergeAppModalClasses(APP_MODAL_CLASS, this.modal.nzClassName);
  }
}
