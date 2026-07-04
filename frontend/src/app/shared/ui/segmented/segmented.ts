import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { BrnToggleGroupImports } from '@spartan-ng/brain/toggle-group';

/**
 * Segmented control built on spartan/brain toggle-group. Contrasting track (zinc-200) with a
 * raised brand thumb (bg-primary) on the active segment. Equal-width, flush segments. Single-select.
 */
@Component({
  selector: 'ui-segmented',
  imports: [BrnToggleGroupImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block max-w-full overflow-x-auto sm:inline-block',
  },
  template: `
    <brn-toggle-group
      class="flex min-w-full h-10 items-center gap-0 rounded-lg p-1 bg-zinc-200 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700 sm:min-w-0"
      [value]="value()"
      (valueChange)="value.set($any($event))"
    >
      @for (o of options(); track o) {
        <button
          brnToggleGroupItem
          [value]="o"
          class="flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-semibold leading-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] text-gray-500 dark:text-zinc-400 data-[state=off]:hover:text-gray-800 dark:data-[state=off]:hover:text-zinc-100 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-[0_1px_2px_rgb(24_24_27/0.12),0_2px_6px_-2px_rgb(24_24_27/0.14),inset_0_1px_0_rgb(255_255_255/0.9)] dark:data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_2px_6px_-2px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.12)]"
        >
          {{ o }}
        </button>
      }
    </brn-toggle-group>
  `,
})
export class UiSegmented {
  readonly options = input<string[]>([]);
  readonly value = model<string>('');
}
