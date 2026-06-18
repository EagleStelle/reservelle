import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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

const calendarCellDays: Array<number | null> = [
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  null,
  null,
  null,
];

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

  protected readonly activeYear = signal('2026');

  protected readonly categories: Category[] = ['All', 'Van', 'FLT', 'Gym'];
  protected readonly activeCategory = signal<Category>('All');

  protected selectCategory(c: Category): void {
    this.activeCategory.set(c);
  }

  protected readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  protected readonly calendarDays = signal<CalendarDay[]>(
    calendarCellDays.map((day, index) => {
      const row = Math.floor(index / 7);
      const rowTone: CalendarDay['rowTone'] =
        row === 3 ? 'plain' : row === 1 ? 'soft' : 'muted';

      return {
        id: `${index}-${day ?? 'empty'}`,
        day,
        rowTone,
        reservations: [],
      };
    }),
  );

  protected readonly upcomingEvents = signal<UpcomingEvent[]>([]);
}
