import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { BrnSelectImports } from '@spartan-ng/brain/select';

import { UiIcon } from '../icon/icon';

export interface UiSelectOption {
  value: string;
  label: string;
}

/**
 * Dropdown styled to match uiInput. Built on spartan/brain select + popover.
 * Works with reactive forms via formControlName / ngModel.
 * Usage: <ui-select formControlName="role" placeholder="Select a role" [options]="roles" />
 */
@Component({
  selector: 'ui-select',
  imports: [BrnPopoverImports, BrnSelectImports, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelect), multi: true }],
  template: `
    <brn-popover sideOffset="6" align="start" closeOnOutsidePointerEvents>
      <div brnSelect [value]="value()" (valueChange)="select($event)" [disabled]="disabled()">
        <button
          brnSelectTrigger
          type="button"
          class="relative h-9 w-full cursor-pointer rounded-md border border-zinc-950/12 bg-white px-3 pr-8 text-left text-sm font-medium text-gray-900 ring-1 ring-inset ring-zinc-200 shadow-[0_1px_1px_rgb(24_24_27/0.08),0_2px_5px_-3px_rgb(24_24_27/0.16),inset_0_1px_0_rgb(255_255_255/0.85)] transition-all duration-200 hover:border-secondary/45 hover:ring-secondary/30 focus:border-primary/55 focus:ring-2 focus:ring-primary/35 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-gray-400 aria-expanded:border-primary/55 aria-expanded:ring-2 aria-expanded:ring-primary/35 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:shadow-[0_1px_1px_rgb(0_0_0/0.35),0_2px_5px_-3px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.1)] dark:data-placeholder:text-zinc-500"
        >
          <span
            class="block truncate"
            [class.text-gray-400]="!selectedLabel()"
            [class.dark:text-zinc-500]="!selectedLabel()"
          >
            {{ selectedLabel() || placeholder() }}
          </span>
          <ui-icon
            name="expand_more"
            class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-lg leading-none text-gray-500 dark:text-zinc-400"
          />
        </button>

        <ng-template brnPopoverContent>
          <div
            brnSelectContent
            class="z-50 max-h-60 w-(--brn-select-width) overflow-y-auto rounded-md border border-zinc-950/12 bg-white/95 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_32px_-18px_rgba(24,24,27,0.34)] dark:border-white/15 dark:bg-zinc-900/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_32px_-18px_rgba(0,0,0,0.85)]"
          >
            @for (opt of options(); track opt.value) {
              <button
                brnSelectItem
                type="button"
                [value]="opt.value"
                class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-sm text-gray-700 transition-colors duration-150 data-highlighted:bg-secondary/10 data-highlighted:text-primary aria-selected:font-medium aria-selected:text-primary dark:text-zinc-300 dark:data-highlighted:bg-secondary/20 dark:data-highlighted:text-zinc-100 dark:aria-selected:text-secondary"
              >
                <span class="truncate">{{ opt.label }}</span>
                @if (value() === opt.value) {
                  <ui-icon name="check" class="shrink-0 text-base text-primary" />
                }
              </button>
            }
          </div>
        </ng-template>
      </div>
    </brn-popover>
  `,
})
export class UiSelect implements ControlValueAccessor {
  readonly options = input<readonly UiSelectOption[]>([]);
  readonly placeholder = input('Select an option');

  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);
  protected readonly selectedLabel = computed(() => {
    const value = this.value();
    return this.options().find((opt) => opt.value === value)?.label ?? null;
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value || null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected select(value: string | null | undefined): void {
    const next = value ?? null;
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
