import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AdminShell } from '../../../shared/layout/admin-shell/admin-shell';
import { UiIcon } from '../../../shared/ui';

@Component({
  selector: 'app-reservation-placeholder',
  imports: [AdminShell, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-shell>
      <div class="flex min-h-[60vh] items-center justify-center">
        <div class="flex max-w-md flex-col items-center gap-4 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
            <ui-icon [name]="icon()" class="text-3xl" />
          </div>
          <div>
            <h1 class="text-xl font-black text-gray-900 dark:text-zinc-100">
              {{ facilityName() }} Reservations
            </h1>
            <p class="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              This reservation workspace has not been connected yet.
            </p>
          </div>
        </div>
      </div>
    </app-admin-shell>
  `,
})
export class ReservationPlaceholder {
  private readonly route = inject(ActivatedRoute);

  protected readonly facilityName = computed(() => this.route.snapshot.data['facilityName'] as string);
  protected readonly icon = computed(() => this.route.snapshot.data['icon'] as string);
}
