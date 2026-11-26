import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { formatDisplayValue } from '../../../core/utils/json-display.util';

@Component({
  selector: 'app-safe-json-viewer',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="safe-json-viewer" [attr.aria-labelledby]="labelId()">
      <div class="safe-json-viewer__toolbar">
        @if (label()) {
          <span class="safe-json-viewer__label" [id]="labelId()">{{ label() }}</span>
        }
        <button
          type="button"
          nz-button
          nzType="text"
          nzSize="small"
          class="safe-json-viewer__copy"
          [attr.aria-label]="copyAriaLabel()"
          (click)="copyToClipboard()"
        >
          <span nz-icon nzType="copy" aria-hidden="true"></span>
          Copy
        </button>
        @if (isLarge()) {
          <button
            type="button"
            nz-button
            nzType="link"
            nzSize="small"
            [attr.aria-expanded]="expanded()"
            [attr.aria-controls]="contentId()"
            (click)="toggleExpanded()"
          >
            {{ expanded() ? 'Collapse' : 'Expand' }}
          </button>
        }
      </div>
      <pre
        class="safe-json-viewer__pre"
        [class.safe-json-viewer__pre--collapsed]="isLarge() && !expanded()"
        [id]="contentId()"
        tabindex="0"
        [attr.aria-label]="preAriaLabel()"
      >{{ displayText() }}</pre>
    </div>
  `,
  styles: [`
    .safe-json-viewer {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .safe-json-viewer__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .safe-json-viewer__label {
      font-weight: 600;
      flex: 1;
      min-width: 0;
      color: var(--app-text-color, inherit);
    }
    .safe-json-viewer__pre {
      margin: 0;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      color: var(--json-viewer-text, var(--app-text-color, rgba(0, 0, 0, 0.85)));
      background: var(--json-viewer-bg, #f5f5f5);
      border: 1px solid var(--json-viewer-border, #d9d9d9);
      border-radius: 4px;
      overflow: auto;
      max-height: 480px;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .safe-json-viewer__pre--collapsed {
      max-height: 120px;
    }
    .safe-json-viewer__pre:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .safe-json-viewer__pre {
        transition: none;
      }
    }
  `],
})
export class SafeJsonViewerComponent {
  private static idCounter = 0;
  private readonly instanceId = ++SafeJsonViewerComponent.idCounter;

  readonly value = input<string | null | undefined>(null);
  readonly label = input<string | undefined>(undefined);
  readonly compact = input(false, { transform: (v: boolean | string) => v === true || v === '' });

  readonly expanded = signal(false);

  readonly formatted = computed(() => formatDisplayValue(this.value()));

  readonly displayText = computed(() => this.formatted().text);

  readonly isLarge = computed(() => {
    if (this.compact()) {
      return false;
    }
    return this.displayText().split('\n').length > 8 || this.displayText().length > 400;
  });

  readonly labelId = computed(() => `safe-json-label-${this.instanceId}`);
  readonly contentId = computed(() => `safe-json-content-${this.instanceId}`);

  readonly copyAriaLabel = computed(() =>
    this.label() ? `Copy ${this.label()} to clipboard` : 'Copy JSON to clipboard',
  );

  readonly preAriaLabel = computed(() =>
    this.label() ? `${this.label()} JSON value` : 'JSON value',
  );

  constructor(private readonly message: NzMessageService) {}

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  async copyToClipboard(): Promise<void> {
    const text = this.displayText();
    try {
      await navigator.clipboard.writeText(text);
      this.message.success('Copied to clipboard');
    } catch {
      this.message.error('Could not copy to clipboard');
    }
  }
}
