import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { CreditNoteDto } from '../../../types/api.types';
import { CreditNotesService } from '../../../core/services/credit-notes.service';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-credit-note-detail',
  standalone: true,
imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzTableModule,
    NzSpaceModule,
    NzButtonModule
  ],
  templateUrl: './credit-note-detail.component.html',
  styleUrls: ['./credit-note-detail.component.css']
})
export class CreditNoteDetailComponent implements OnInit {
  protected readonly destroy$ = new Subject<void>();

  creditNoteId: string | null = null;
  loading = false;
  creditNote: CreditNoteDto | null = null;

  readonly paths = APP_PATHS.BILLING;

  private readonly route = inject(ActivatedRoute);
  private readonly creditNotesService = inject(CreditNotesService);
  private readonly message = inject(NzMessageService);

  ngOnInit(): void {
    this.creditNoteId = this.route.snapshot.paramMap.get('id');
    if (this.creditNoteId) {
      this.loadCreditNote(this.creditNoteId);
    }
  }

  loadCreditNote(id: string): void {
    this.loading = true;
    this.creditNotesService.getById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (creditNote) => {
        this.creditNote = creditNote;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load credit note: ' + err.message);
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Applied': return 'green';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}