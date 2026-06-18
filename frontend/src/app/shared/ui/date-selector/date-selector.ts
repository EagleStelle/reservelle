import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { BrnButtonImports } from '@spartan-ng/brain/button';
import { BrnPopover, BrnPopoverImports } from '@spartan-ng/brain/popover';

import { UiIcon } from '../icon/icon';

interface MonthOption {
  label: string;
  shortLabel: string;
  value: number;
}

const MONTHS: MonthOption[] = [
  { label: 'January', shortLabel: 'Jan', value: 0 },
  { label: 'February', shortLabel: 'Feb', value: 1 },
  { label: 'March', shortLabel: 'Mar', value: 2 },
  { label: 'April', shortLabel: 'Apr', value: 3 },
  { label: 'May', shortLabel: 'May', value: 4 },
  { label: 'June', shortLabel: 'Jun', value: 5 },
  { label: 'July', shortLabel: 'Jul', value: 6 },
  { label: 'August', shortLabel: 'Aug', value: 7 },
  { label: 'September', shortLabel: 'Sep', value: 8 },
  { label: 'October', shortLabel: 'Oct', value: 9 },
  { label: 'November', shortLabel: 'Nov', value: 10 },
  { label: 'December', shortLabel: 'Dec', value: 11 },
];

function parseYearMonth(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;

  if (!Number.isInteger(year) || month < 0 || month > 11) {
    return null;
  }

  return { year, month };
}

function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** Month/year picker. Styled like the segmented control, built on spartan/brain button + popover. */
@Component({
  selector: 'ui-date-selector',
  imports: [BrnButtonImports, BrnPopoverImports, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <brn-popover #datePopover="brnPopover" sideOffset="6" align="start">
      <button
        brnButton
        brnPopoverTrigger
        type="button"
        (click)="syncPickerYear()"
        class="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-2.5 text-sm font-bold leading-none text-gray-600 elevated-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary hover:text-white hover:ring-transparent active:scale-[0.97] sm:px-4"
      >
        <ui-icon name="calendar_today" class="text-sm" />
        <span>{{ displayValue() }}</span>
        <ui-icon name="expand_more" class="text-sm" />
      </button>

      <ng-template brnPopoverContent>
        <div
          class="z-50 w-72 rounded-xl border border-gray-200 bg-white p-3 text-gray-900 shadow-lg"
        >
          <div class="flex items-center justify-between gap-2">
            <button
              brnButton
              type="button"
              aria-label="Previous year"
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-secondary/10 hover:text-primary"
              (click)="shiftYear(-1)"
            >
              <ui-icon name="chevron_left" class="text-lg" />
            </button>

            <div class="text-sm font-extrabold text-primary">{{ pickerYear() }}</div>

            <button
              brnButton
              type="button"
              aria-label="Next year"
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-secondary/10 hover:text-primary"
              (click)="shiftYear(1)"
            >
              <ui-icon name="chevron_right" class="text-lg" />
            </button>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-1.5">
            @for (month of months; track month.value) {
              <button
                brnButton
                type="button"
                class="h-9 cursor-pointer rounded-lg text-sm font-semibold text-gray-600 transition-colors hover:bg-secondary/10 hover:text-primary"
                [class.bg-primary]="isSelectedMonth(month.value)"
                [class.text-white]="isSelectedMonth(month.value)"
                [class.hover:bg-primary]="isSelectedMonth(month.value)"
                [class.hover:text-white]="isSelectedMonth(month.value)"
                (click)="selectMonth(month.value, datePopover)"
              >
                {{ month.shortLabel }}
              </button>
            }
          </div>
        </div>
      </ng-template>
    </brn-popover>
  `,
})
export class UiDateSelector {
  readonly value = model<string>('');

  protected readonly months = MONTHS;
  protected readonly pickerYear = signal(new Date().getFullYear());

  protected readonly selectedDate = computed(() => parseYearMonth(this.value()));

  protected readonly displayValue = computed(() => {
    const selected = this.selectedDate();

    if (!selected) {
      return 'Select date';
    }

    return `${MONTHS[selected.month].label} ${selected.year}`;
  });

  protected syncPickerYear(): void {
    this.pickerYear.set(this.selectedDate()?.year ?? new Date().getFullYear());
  }

  protected shiftYear(delta: number): void {
    this.pickerYear.update((year) => year + delta);
  }

  protected isSelectedMonth(month: number): boolean {
    const selected = this.selectedDate();
    return selected?.year === this.pickerYear() && selected.month === month;
  }

  protected selectMonth(month: number, popover: BrnPopover): void {
    this.value.set(formatYearMonth(this.pickerYear(), month));
    popover.close();
  }
}
