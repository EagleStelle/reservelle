import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type StatusTone = 'success' | 'warning' | 'danger' | 'muted';

@Component({
  selector: 'ui-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase"
      [class.bg-green-100]="tone() === 'success'"
      [class.text-green-700]="tone() === 'success'"
      [class.bg-amber-100]="tone() === 'warning'"
      [class.text-amber-700]="tone() === 'warning'"
      [class.bg-red-100]="tone() === 'danger'"
      [class.text-red-600]="tone() === 'danger'"
      [class.bg-gray-100]="tone() === 'muted'"
      [class.text-gray-600]="tone() === 'muted'"
    >
      {{ status() }}
    </span>
  `,
})
export class UiStatusBadge {
  readonly status = input('');

  private static readonly SUCCESS = new Set(['ACTIVE', 'AVAILABLE', 'APPROVED', 'COMPLETED']);
  private static readonly WARNING = new Set(['PENDING']);
  private static readonly MUTED = new Set(['CANCELLED']);

  protected readonly tone = computed<StatusTone>(() => {
    const status = this.status().toUpperCase();
    if (UiStatusBadge.SUCCESS.has(status)) return 'success';
    if (UiStatusBadge.WARNING.has(status)) return 'warning';
    if (UiStatusBadge.MUTED.has(status)) return 'muted';
    return 'danger';
  });
}
