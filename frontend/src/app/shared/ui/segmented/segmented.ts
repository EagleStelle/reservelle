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
      class="flex min-w-full h-9 items-center gap-0.5 rounded-md p-0.5 bg-zinc-200/80 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700 sm:min-w-0"
      [value]="value()"
      (valueChange)="value.set($any($event))"
    >
      @for (o of options(); track o) {
        <button
          brnToggleGroupItem
          [value]="o"
          class="flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium leading-none transition-all duration-300 ease-spring active:scale-[0.97] text-gray-600 dark:text-zinc-400 data-[state=off]:hover:bg-white/45 data-[state=off]:hover:text-gray-900 dark:data-[state=off]:hover:bg-white/5 dark:data-[state=off]:hover:text-zinc-100 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-[0_1px_1px_rgb(24_24_27/0.1),0_2px_5px_-3px_rgb(24_24_27/0.18),inset_0_1px_0_rgb(255_255_255/0.55)] dark:data-[state=on]:shadow-[0_1px_1px_rgb(0_0_0/0.35),0_2px_5px_-3px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.12)]"
        >
          {{ displayLabel(o) }}
        </button>
      }
    </brn-toggle-group>
  `,
})
export class UiSegmented {
  readonly options = input<string[]>([]);
  readonly value = model<string>('');

  protected displayLabel(option: string): string {
    const cleaned = option.replace(/[_-]+/g, ' ');

    if (cleaned.length <= 3 || cleaned !== cleaned.toUpperCase()) {
      return cleaned;
    }

    return cleaned.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
