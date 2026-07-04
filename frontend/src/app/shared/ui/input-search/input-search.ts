import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { UiInput } from '../input/input';
import { UiIcon } from '../icon/icon';

/** Search field: leading search icon + text input. Built on the uiInput directive. */
@Component({
  selector: 'ui-input-search',
  imports: [UiInput, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block w-full text-gray-500 dark:text-zinc-400' },
  template: `
    <ui-icon
      name="search"
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-current"
    />
    <input
      uiInput
      type="search"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      class="pl-9! h-9! py-0! [&::-webkit-search-cancel-button]:appearance-none"
    />
  `,
})
export class UiInputSearch {
  readonly value = model<string>('');
}
