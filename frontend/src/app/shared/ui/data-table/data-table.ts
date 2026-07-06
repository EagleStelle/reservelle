import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <section
      class="card-surface relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md"
    >
      <div class="min-h-0 flex-1 overflow-auto">
        <table [class]="'w-full border-collapse text-left text-[13px] ' + minWidthClass()">
          <ng-content />
        </table>
      </div>
      @if (loading()) {
        <div
          class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60"
        >
          <div
            class="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary dark:border-zinc-700 dark:border-t-primary"
          ></div>
        </div>
      }
    </section>
  `,
})
export class UiDataTable {
  readonly minWidthClass = input('min-w-150');
  readonly loading = input(false);
}
