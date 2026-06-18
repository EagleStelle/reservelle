import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { AdminShell } from '../../../shared/layout/admin-shell/admin-shell';
import { UiIcon, UiSegmented, UiDateSelector } from '../../../shared/ui';

interface StatCard {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: string;
  iconBg: string;
  iconFg: string;
  valueColor: string;
}

interface CalendarReservation {
  id: string;
  title: string;
}

interface CalendarDay {
  id: string;
  day: number | null;
  rowTone: 'muted' | 'soft' | 'plain';
  reservations: CalendarReservation[];
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
}

type Category = 'All' | 'Van' | 'FLT' | 'Gym';

const CALENDAR_CELL_COUNT = 42;
const DEFAULT_YEAR_MONTH = '2026-06';

function parseYearMonth(value: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  const year = match ? Number(match[1]) : 2026;
  const month = match ? Number(match[2]) - 1 : 5;

  if (!Number.isInteger(year) || month < 0 || month > 11) {
    return { year: 2026, month: 5 };
  }

  return { year, month };
}

function createCalendarDays(value: string): CalendarDay[] {
  const { year, month } = parseYearMonth(value);
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) => {
    const row = Math.floor(index / 7);
    const dayOffset = index - firstWeekday;
    const day = dayOffset >= 0 && dayOffset < daysInMonth ? dayOffset + 1 : null;
    const rowTone: CalendarDay['rowTone'] =
      row === 3 ? 'plain' : row === 1 || row === 4 ? 'soft' : 'muted';

    return {
      id: `${value}-${index}-${day ?? 'empty'}`,
      day,
      rowTone,
      reservations: [],
    };
  });
}

@Component({
  selector: 'app-dashboard',
  imports: [AdminShell, UiIcon, UiSegmented, UiDateSelector],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {

  protected readonly stats: StatCard[] = [
    {
      label: 'Total',
      value: '2,456',
      delta: '12.5%',
      trend: 'up',
      icon: 'monitoring',
      iconBg: 'bg-primary/10',
      iconFg: 'text-primary',
      valueColor: 'text-primary',
    },
    {
      label: 'Pending',
      value: '2,456',
      delta: '12.5%',
      trend: 'up',
      icon: 'pending_actions',
      iconBg: 'bg-orange-50',
      iconFg: 'text-orange-500',
      valueColor: 'text-orange-500',
    },
    {
      label: 'Accepted',
      value: '159',
      delta: '12.5%',
      trend: 'down',
      icon: 'check_circle',
      iconBg: 'bg-green-50',
      iconFg: 'text-green-500',
      valueColor: 'text-green-600',
    },
    {
      label: 'Rejected',
      value: '200',
      delta: '12.5%',
      trend: 'down',
      icon: 'cancel',
      iconBg: 'bg-red-50',
      iconFg: 'text-red-500',
      valueColor: 'text-red-600',
    },
  ];

  protected readonly activeDate = signal(DEFAULT_YEAR_MONTH);

  protected readonly categories: Category[] = ['All', 'Van', 'FLT', 'Gym'];
  protected readonly activeCategory = signal<Category>('All');

  protected selectCategory(c: Category): void {
    this.activeCategory.set(c);
  }

  protected selectDate(value: string): void {
    this.activeDate.set(value);
  }

  protected readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  protected readonly calendarDays = computed(() => createCalendarDays(this.activeDate()));

  protected readonly upcomingEvents = signal<UpcomingEvent[]>([]);
}
