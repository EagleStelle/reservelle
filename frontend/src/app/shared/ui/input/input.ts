import { Directive } from '@angular/core';
import { BrnInput } from '@spartan-ng/brain/input';

/** Text input. Built on spartan/brain input (field + validation state). */
@Directive({
  selector: 'input[uiInput]',
  hostDirectives: [BrnInput],
  host: {
    class:
      'w-full rounded-lg bg-white px-3 py-2 text-[13px] sm:px-3.5 sm:py-2.5 sm:text-sm elevated-sm ring-gray-200 ' +
      'text-gray-900 placeholder:text-gray-400 ' +
      'transition-all duration-200 ease-out ' +
      'hover:ring-secondary focus:ring-primary focus:outline-none',
  },
})
export class UiInput {}
