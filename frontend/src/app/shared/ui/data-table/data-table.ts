import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <section class="card-surface animate-rise flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
      <div class="min-h-0 flex-1 overflow-auto">
        <table [class]="'w-full border-collapse text-left text-sm ' + minWidthClass()">
          <ng-content />
        </table>
      </div>
    </section>
  `,
})
export class UiDataTable {
  readonly minWidthClass = input('min-w-150');
}
