import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { UiIcon } from '../../../../shared/ui';

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

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

type Range = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

@Component({
  selector: 'app-dashboard',
  imports: [UiIcon],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly nav: NavItem[] = [
    { label: 'Dashboard', icon: 'grid_view', active: true },
    { label: 'Users', icon: 'group' },
    { label: 'Equipments', icon: 'inventory_2' },
    { label: 'Vehicles', icon: 'directions_car' },
    { label: 'Reservation', icon: 'event_note' },
  ];

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

  protected readonly ranges: Range[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  protected readonly activeRange = signal<Range>('Monthly');

  protected selectRange(r: Range): void {
    this.activeRange.set(r);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
