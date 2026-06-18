import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Material Symbols glyph. Usage: <ui-icon name="visibility" /> */
@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="material-symbols-outlined"
    aria-hidden="true"
    [style.font-size.px]="size()"
  >{{ name() }}</span>`,
  host: { class: 'inline-flex' },
})
export class UiIcon {
  readonly name = input.required<string>();
  readonly size = input<number>();
}
