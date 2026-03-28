import { TestBed } from '@angular/core/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AppConfirmDialogService } from './app-confirm-dialog.service';
import { APP_MODAL_CLASS, APP_MODAL_CONFIRM_SKIN_CLASS, APP_MODAL_WRAP_CLASS } from '../constants/app-modal.constants';

describe('AppConfirmDialogService', () => {
  let nzModal: jasmine.SpyObj<NzModalService>;
  let service: AppConfirmDialogService;

  beforeEach(() => {
    nzModal = jasmine.createSpyObj('NzModalService', ['confirm', 'info', 'success', 'warning', 'error', 'create']);
    nzModal.confirm.and.returnValue({} as any);

    TestBed.configureTestingModule({
      providers: [{ provide: NzModalService, useValue: nzModal }, AppConfirmDialogService],
    });
    service = TestBed.inject(AppConfirmDialogService);
  });

  it('should merge theme classes into confirm()', () => {
    service.confirm({ nzTitle: 'T' });
    expect(nzModal.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nzTitle: 'T',
        nzWrapClassName: APP_MODAL_WRAP_CLASS,
        nzClassName: jasmine.stringMatching(
          new RegExp(`${APP_MODAL_CLASS}.*${APP_MODAL_CONFIRM_SKIN_CLASS}`),
        ),
      }),
    );
  });

  it('deleteConfirm should set entity defaults', () => {
    service.deleteConfirm({ entityLabel: 'widget' });
    expect(nzModal.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nzTitle: 'Delete widget',
        nzContent: 'Are you sure you want to delete this widget?',
        nzOkText: 'Delete',
        nzOkDanger: true,
      }),
    );
  });
});
