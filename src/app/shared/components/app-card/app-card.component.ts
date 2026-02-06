import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NzCardModule],
  template: `
    <nz-card [nzTitle]="title" [nzExtra]="extra" [nzBordered]="bordered">
      <ng-content></ng-content>
    </nz-card>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 16px;
    }
  `]
})
export class AppCardComponent {
  @Input() title?: string | TemplateRef<void>;
  @Input() extra?: string | TemplateRef<void>;
  @Input() bordered = true;
}
