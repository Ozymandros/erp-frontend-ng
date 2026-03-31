import { Injectable, inject } from '@angular/core';
import { ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {
  APP_MODAL_CLASS,
  APP_MODAL_CONFIRM_SKIN_CLASS,
  APP_MODAL_WRAP_CLASS,
  mergeAppModalClasses,
} from '../constants/app-modal.constants';

/**
 * Wraps {@link NzModalService} so all programmatic modals get consistent
 * `nzWrapClassName` / `nzClassName` for theme-aligned styling.
 *
 * Prefer this over injecting `NzModalService` directly for confirm / presets.
 */
@Injectable({ providedIn: 'root' })
export class AppConfirmDialogService {
  private readonly nzModal = inject(NzModalService);

  /** Standard confirm dialog (OK + Cancel). */
  confirm<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.withTheme((o) => this.nzModal.confirm(o), options);
  }

  /** Destructive action — defaults to Delete title/copy and danger OK. */
  deleteConfirm<T>(options: ModalOptions<T> & { entityLabel?: string } = {}): NzModalRef<T> {
    const { entityLabel, nzTitle, nzContent, nzOkText, nzOkDanger, ...rest } = options;
    const label = entityLabel ?? 'item';
    return this.confirm({
      ...rest,
      nzTitle: nzTitle ?? `Delete ${label}`,
      nzContent: nzContent ?? `Are you sure you want to delete this ${label}?`,
      nzOkText: nzOkText ?? 'Delete',
      nzOkDanger: nzOkDanger ?? true,
    } as ModalOptions<T>);
  }

  info<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.withTheme((o) => this.nzModal.info(o), options);
  }

  success<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.withTheme((o) => this.nzModal.success(o), options);
  }

  error<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.withTheme((o) => this.nzModal.error(o), options);
  }

  warning<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.withTheme((o) => this.nzModal.warning(o), options);
  }

  /** Custom content modal (component / template) with theme classes. */
  create<T, D = unknown, R = unknown>(options: ModalOptions<T, D, R>): NzModalRef<T, R> {
    return this.withTheme((o) => this.nzModal.create(o), options);
  }

  /** Raw service when you must bypass theme defaults (rare). */
  get underlying(): NzModalService {
    return this.nzModal;
  }

  private withTheme<T, R>(
    open: (opts: ModalOptions<T, unknown, R>) => NzModalRef<T, R>,
    options: ModalOptions<T, unknown, R>,
  ): NzModalRef<T, R> {
    const { nzWrapClassName, nzClassName, ...rest } = options;
    return open({
      ...rest,
      nzWrapClassName: mergeAppModalClasses(APP_MODAL_WRAP_CLASS, nzWrapClassName),
      nzClassName: mergeAppModalClasses(
        APP_MODAL_CLASS,
        APP_MODAL_CONFIRM_SKIN_CLASS,
        nzClassName,
      ),
    } as ModalOptions<T, unknown, R>);
  }
}
