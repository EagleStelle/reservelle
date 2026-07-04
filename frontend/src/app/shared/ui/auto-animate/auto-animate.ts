import { Directive, ElementRef, PLATFORM_ID, effect, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import autoAnimate, { type AutoAnimateOptions } from '@formkit/auto-animate';

/**
 * Auto-animates add/remove/move of a container's direct children (FLIP under the hood).
 * Wrap a list/grid/tbody: `<tbody uiAutoAnimate>`. Browser-only — no-op during SSR.
 * Respects prefers-reduced-motion internally.
 */
@Directive({
  selector: '[uiAutoAnimate]',
})
export class UiAutoAnimate {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Accepts a bare attribute (`uiAutoAnimate`) or an options object; '' coerces to defaults.
  readonly options = input<Partial<AutoAnimateOptions>, '' | Partial<AutoAnimateOptions>>(
    {},
    { alias: 'uiAutoAnimate', transform: (v) => (v === '' ? {} : v) },
  );

  constructor() {
    effect(() => {
      const opts = this.options();
      if (this.isBrowser) autoAnimate(this.el.nativeElement, opts);
    });
  }
}
