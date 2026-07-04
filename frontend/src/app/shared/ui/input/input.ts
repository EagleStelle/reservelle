import { Directive } from '@angular/core';
import { BrnInput } from '@spartan-ng/brain/input';

/** Text input. Built on spartan/brain input (field + validation state). */
@Directive({
  selector: 'input[uiInput]',
  hostDirectives: [BrnInput],
  host: {
    class:
      'w-full rounded-lg bg-white dark:bg-zinc-800 h-10 px-4 text-sm ' +
      'text-gray-900 dark:text-zinc-100 placeholder:text-gray-500 dark:placeholder:text-zinc-400 ' +
      'ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700 ' +
      'shadow-[0_1px_2px_rgb(24_24_27/0.12),0_2px_6px_-2px_rgb(24_24_27/0.14),inset_0_1px_0_rgb(255_255_255/0.9)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_2px_6px_-2px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.12)] ' +
      'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-secondary dark:hover:ring-secondary ' +
      'focus:ring-2 focus:ring-primary focus:outline-none',
  },
})
export class UiInput {}
