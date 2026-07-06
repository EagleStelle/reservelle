import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FltRescheduleCalendar, RescheduleEvent } from './flt-reschedule-calendar';
import { CoordinationSlot, FltCoordinationCalendar } from './flt-coordination-calendar';

import { AdminShell } from '../../../../shared/layout/admin-shell/admin-shell';
import {
  UiAutoAnimate,
  UiButton,
  UiDataTable,
  UiIcon,
  UiInputSearch,
  UiSegmented,
  UiStatusBadge,
  UiToast,
} from '../../../../shared/ui';
import {
  FltReservationRecord,
  RequestedEquipmentItem,
  ReservationStatus,
  ReservedDateSlot,
  SetCoordinationRequest,
} from './flt-reservations.models';
import { FltReservationsService } from './flt-reservations.service';

const STATUS_FILTERS = ['All', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface ConfirmState {
  id: number;
  action: ReservationStatus;
  eventTitle: string;
}

@Component({
  selector: 'app-flt-reservations',
  imports: [
    AdminShell,
    UiAutoAnimate,
    UiButton,
    UiDataTable,
    UiIcon,
    UiInputSearch,
    UiSegmented,
    UiStatusBadge,
    UiToast,
    FltRescheduleCalendar,
    FltCoordinationCalendar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-shell>
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-black text-gray-900 dark:text-zinc-100">FLT Theater Reservations</h1>
          <p class="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Review and manage all FLT reservation requests</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <ui-icon name="event_note" class="text-primary text-base" />
          <span>{{ filtered().length }} of {{ reservations().length }} shown</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <ui-input-search
          placeholder="Search by event, department, contact..."
          (valueChange)="search.set($event)"
          class="flex-1"
        />
        <ui-segmented [options]="statusFilters" [value]="statusFilter()" (valueChange)="statusFilter.set($any($event))" />
      </div>

      <!-- Table -->
        <ui-data-table minWidthClass="min-w-[92rem]" [loading]="loading()">
            <thead class="sticky top-0 z-10">
              <tr class="bg-primary text-sm font-semibold text-white">
                <th class="w-[4%] px-3.5 py-2.5">#</th>
                <th class="w-[19%] px-3 py-2.5">Event</th>
                <th class="w-[12%] px-3 py-2.5">Dept / Org</th>
                <th class="w-[14%] px-3 py-2.5">Contact</th>
                <th class="w-[15%] px-3 py-2.5">Dates</th>
                <th class="w-[9%] px-3 py-2.5">Room / Pax</th>
                <th class="w-[10%] px-3 py-2.5">Equipment</th>
                <th class="w-[8%] px-3 py-2.5 text-center">Status</th>
                <th class="w-[9%] px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody uiAutoAnimate>
              @if (apiError()) {
                <tr>
                  <td colspan="9" class="px-3 py-6 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <p class="text-sm font-semibold text-red-600">Failed to load reservations</p>
                      <button uiButton type="button" (click)="load()">
                        <ui-icon name="refresh" class="text-base" />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              } @else if (!loading() && filtered().length === 0) {
                <tr>
                  <td colspan="9" class="px-3 py-6 text-center text-gray-500 dark:text-zinc-400">
                    No reservations found.
                  </td>
                </tr>
              } @else {
                @for (row of filtered(); track row.id) {
                <tr class="border-b border-zinc-200 transition-colors hover:bg-secondary/5 dark:border-zinc-700 dark:hover:bg-secondary/15">
                  <td class="px-3.5 py-2.5 text-xs text-black dark:text-zinc-100 font-mono">{{ row.id }}</td>

                  <!-- Event -->
                  <td class="px-3 py-2.5 max-w-50 cursor-pointer text-black dark:text-zinc-100" (click)="openDetails(row)">
                    <p class="font-semibold text-gray-900 dark:text-zinc-100 truncate">{{ row.eventTitle }}</p>
                    <p class="text-xs text-gray-500 dark:text-zinc-400 capitalize">{{ row.eventType }}</p>
                    <p class="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">{{ formatDate(row.createdAt) }}</p>
                    @if (row.additionalInstructions) {
                      <p class="mt-1 text-[10px] italic text-amber-600 dark:text-amber-400 truncate max-w-45" [title]="row.additionalInstructions">
                        📝 {{ row.additionalInstructions }}
                      </p>
                    }
                    <p class="mt-1 text-[10px] font-semibold text-primary">Click to view full summary</p>
                  </td>

                  <!-- Dept / Org -->
                  <td class="px-3 py-2.5 max-w-40 text-black dark:text-zinc-100">
                    <p class="text-xs font-medium text-gray-700 dark:text-zinc-300 truncate">{{ row.department }}</p>
                    <p class="text-xs text-gray-400 dark:text-zinc-500 truncate">{{ row.organization }}</p>
                  </td>

                  <!-- Contact -->
                  <td class="px-3 py-2.5 max-w-40 text-black dark:text-zinc-100">
                    <p class="text-xs font-medium text-gray-700 dark:text-zinc-300 truncate">{{ row.contactPerson }}</p>
                    <p class="text-xs text-gray-400 dark:text-zinc-500 truncate">{{ row.contactEmail }}</p>
                    <p class="text-xs text-gray-400 dark:text-zinc-500">{{ row.contactNumber }}</p>
                  </td>

                  <!-- Dates -->
                  <td class="px-3 py-2.5 max-w-45 text-black dark:text-zinc-100">
                    @for (slot of parseDates(row.reservedDates); track slot.date) {
                      <div class="text-[11px] leading-tight text-gray-600 dark:text-zinc-400 flex items-center gap-1 mb-0.5">
                        <ui-icon name="calendar_today" class="text-[10px] text-primary shrink-0" />
                        <span>{{ slot.date }}</span>
                        <span class="text-gray-400">{{ slot.startTime }}–{{ slot.endTime }}</span>
                      </div>
                    }
                  </td>

                  <!-- Room / Pax -->
                  <td class="px-3 py-2.5 max-w-32.5 text-black dark:text-zinc-100">
                    <p class="text-xs font-medium text-gray-700 dark:text-zinc-300">{{ row.roomType ? getRoomTypeLabel(row.roomType) : '—' }}</p>
                    @if (row.expectedAttendees) {
                      <p class="text-xs text-gray-400 dark:text-zinc-500">{{ row.expectedAttendees }} pax</p>
                    }
                  </td>

                  <!-- Equipment -->
                  <td class="px-3 py-2.5 max-w-35 text-black dark:text-zinc-100">
                    @if (parseEquipment(row.requestedEquipment).length > 0) {
                      @for (eq of parseEquipment(row.requestedEquipment); track eq.id) {
                        <div class="text-[11px] text-gray-600 dark:text-zinc-400 flex items-center gap-1 mb-0.5">
                          <ui-icon name="devices" class="text-[10px] shrink-0" />
                          {{ eq.name }}
                        </div>
                      }
                    } @else {
                      <span class="text-xs text-gray-400 dark:text-zinc-500 italic">None</span>
                    }
                  </td>

                  <!-- Status -->
                  <td class="px-3 py-2.5 text-center">
                    <ui-status-badge [status]="row.status" />
                    @if (row.status === 'COMPLETED' && row.satisfactionRating) {
                      <div class="flex items-center gap-0.5 mt-1.5" [title]="row.satisfactionRating + ' / 5'">
                        @for (star of [1,2,3,4,5]; track star) {
                          <span class="text-sm" [class.text-yellow-400]="star <= row.satisfactionRating!" [class.text-gray-300]="star > row.satisfactionRating!">★</span>
                        }
                      </div>
                    }
                  </td>

                  <!-- Actions -->
                  <td class="px-3 py-2.5">
                    @if (row.status === 'PENDING') {
                      <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-zinc-400">
                        <button
                          type="button"
                          (click)="requestConfirm(row, 'APPROVED')"
                          [disabled]="acting() === row.id"
                          title="Approve"
                          class="cursor-pointer rounded-md p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ui-icon name="check_circle" class="text-xl" />
                        </button>
                        <button
                          type="button"
                          (click)="requestConfirm(row, 'REJECTED')"
                          [disabled]="acting() === row.id"
                          title="Reject"
                          class="cursor-pointer rounded-md p-1 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ui-icon name="cancel" class="text-xl" />
                        </button>
                      </div>
                    } @else if (row.status === 'APPROVED') {
                      <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-zinc-400">
                        <button
                          type="button"
                          (click)="openCoordination(row)"
                          [disabled]="acting() === row.id"
                          class="cursor-pointer rounded-md p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                          [title]="row.coordinationDate ? 'Update coordination: ' + row.coordinationDate : 'Set coordination meeting'"
                        >
                          <ui-icon name="handshake" class="text-xl" />
                        </button>
                        <button
                          type="button"
                          (click)="openReschedule(row)"
                          [disabled]="acting() === row.id"
                          title="Reschedule"
                          class="cursor-pointer rounded-md p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ui-icon name="edit_calendar" class="text-xl" />
                        </button>
                        <button
                          type="button"
                          (click)="requestConfirm(row, 'COMPLETED')"
                          [disabled]="acting() === row.id"
                          title="Complete"
                          class="cursor-pointer rounded-md p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ui-icon name="task_alt" class="text-xl" />
                        </button>
                        @if (row.coordinationDate && row.coordinationStartTime && row.coordinationEndTime) {
                          <button
                            type="button"
                            (click)="downloadReservationForm(row)"
                            [disabled]="acting() === row.id"
                            class="cursor-pointer rounded-md p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            title="Download reservation form"
                          >
                            <ui-icon name="download" class="text-xl" />
                          </button>
                        }
                        <button
                          type="button"
                          (click)="requestConfirm(row, 'CANCELLED')"
                          [disabled]="acting() === row.id"
                          title="Cancel"
                          class="cursor-pointer rounded-md p-1 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ui-icon name="block" class="text-xl" />
                        </button>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-300 dark:text-zinc-600 italic">—</span>
                    }
                  </td>
                </tr>
                }
              }
            </tbody>
        </ui-data-table>

      <!-- Event Details Summary Dialog -->
      @if (detailsTarget()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" (click)="closeDetails()">
          <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 shadow-2xl p-4 flex flex-col gap-4" (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-black text-gray-900 dark:text-zinc-100">Event Summary</h2>
                <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Reservation #{{ detailsTarget()!.id }} · {{ detailsTarget()!.status }}</p>
              </div>
              <button
                type="button"
                (click)="closeDetails()"
                class="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ui-icon name="close" class="text-lg" />
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-2.5">
                <p class="text-xs font-medium text-gray-400">Event</p>
                <p class="font-semibold text-gray-900 dark:text-zinc-100 mt-1">{{ detailsTarget()!.eventTitle }}</p>
                <p class="text-xs text-gray-500 dark:text-zinc-400 capitalize">{{ detailsTarget()!.eventType }}</p>
              </div>
              <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-2.5">
                <p class="text-xs font-medium text-gray-400">Organization</p>
                <p class="font-semibold text-gray-900 dark:text-zinc-100 mt-1">{{ detailsTarget()!.organization }}</p>
                <p class="text-xs text-gray-500 dark:text-zinc-400">{{ detailsTarget()!.department }}</p>
              </div>
              <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-2.5">
                <p class="text-xs font-medium text-gray-400">Contact</p>
                <p class="font-semibold text-gray-900 dark:text-zinc-100 mt-1">{{ detailsTarget()!.contactPerson }}</p>
                <p class="text-xs text-gray-500 dark:text-zinc-400">{{ detailsTarget()!.contactEmail }}</p>
                <p class="text-xs text-gray-500 dark:text-zinc-400">{{ detailsTarget()!.contactNumber }}</p>
              </div>
              <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-2.5">
                <p class="text-xs font-medium text-gray-400">Room / Attendees</p>
                <p class="font-semibold text-gray-900 dark:text-zinc-100 mt-1">{{ detailsTarget()!.roomType ? getRoomTypeLabel(detailsTarget()!.roomType) : '—' }}</p>
                <p class="text-xs text-gray-500 dark:text-zinc-400">{{ detailsTarget()!.expectedAttendees || '—' }} pax</p>
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-3">
              <p class="text-xs font-medium text-gray-400 mb-2">Reserved Dates</p>
              <div class="flex flex-col gap-1.5">
                @for (slot of parseDates(detailsTarget()!.reservedDates); track slot.date + '-' + slot.startTime) {
                  <p class="text-sm text-gray-700 dark:text-zinc-300">• {{ slot.date }} · {{ slot.startTime }} – {{ slot.endTime }}</p>
                }
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-3">
              <p class="text-xs font-medium text-gray-400 mb-2">Requested Equipment</p>
              @if (parseEquipment(detailsTarget()!.requestedEquipment).length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (eq of parseEquipment(detailsTarget()!.requestedEquipment); track eq.id) {
                    <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 text-xs text-gray-700 dark:text-zinc-300">{{ eq.name }}</span>
                  }
                </div>
              } @else {
                <p class="text-sm italic text-gray-400 dark:text-zinc-500">No equipment requested.</p>
              }
            </div>

            @if (detailsTarget()!.coordinationDate) {
              <div class="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-3">
                <p class="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Coordination Meeting</p>
                <p class="text-sm text-amber-900 dark:text-amber-200">{{ detailsTarget()!.coordinationDate }} · {{ detailsTarget()!.coordinationStartTime }} – {{ detailsTarget()!.coordinationEndTime }}</p>
              </div>
            }

            @if (detailsTarget()!.additionalInstructions) {
              <div class="rounded-lg border border-gray-200 dark:border-zinc-700 p-3">
                <p class="text-xs font-medium text-gray-400 mb-1">Additional Instructions</p>
                <p class="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{{ detailsTarget()!.additionalInstructions }}</p>
              </div>
            }

            <div class="flex justify-end">
              <button
                type="button"
                (click)="closeDetails()"
                class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Confirmation Dialog -->
      @if (confirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" (click)="confirm.set(null)">
          <div class="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 shadow-2xl p-4 flex flex-col gap-4" (click)="$event.stopPropagation()">
            <div class="flex items-start gap-3">
              @if (confirm()!.action === 'APPROVED') {
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                  <ui-icon name="check_circle" class="text-emerald-600 dark:text-emerald-400 text-xl" />
                </div>
              } @else if (confirm()!.action === 'REJECTED') {
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
                  <ui-icon name="cancel" class="text-red-600 dark:text-red-400 text-xl" />
                </div>
              } @else if (confirm()!.action === 'COMPLETED') {
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/60">
                  <ui-icon name="task_alt" class="text-teal-600 dark:text-teal-400 text-xl" />
                </div>
              } @else {
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                  <ui-icon name="block" class="text-gray-600 dark:text-zinc-400 text-xl" />
                </div>
              }
              <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold text-gray-900 dark:text-zinc-100">
                  {{ actionLabel(confirm()!.action) }} Reservation
                </h2>
                <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Are you sure you want to mark the reservation for
                  <strong>"{{ confirm()!.eventTitle }}"</strong> as <strong class="lowercase">{{ confirm()!.action.toLowerCase() }}</strong>? This cannot be undone.
                </p>
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button
                type="button"
                (click)="confirm.set(null)"
                class="rounded-md border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="executeAction()"
                [disabled]="acting() !== null"
                class="rounded-md px-3 py-1.5 text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [class.bg-emerald-600]="confirm()!.action === 'APPROVED'"
                [class.hover:bg-emerald-700]="confirm()!.action === 'APPROVED'"
                [class.bg-red-600]="confirm()!.action === 'REJECTED'"
                [class.hover:bg-red-700]="confirm()!.action === 'REJECTED'"
                [class.bg-teal-600]="confirm()!.action === 'COMPLETED'"
                [class.hover:bg-teal-700]="confirm()!.action === 'COMPLETED'"
                [class.bg-gray-600]="confirm()!.action === 'CANCELLED'"
                [class.hover:bg-gray-700]="confirm()!.action === 'CANCELLED'"
              >
                @if (acting() !== null) {
                  <ui-icon name="autorenew" class="text-base animate-spin" />
                } @else {
                  Confirm
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      <ui-toast
        class="contents"
        [show]="showToast()"
        [success]="toastSuccess()"
        [message]="toastMessage()"
      />
    </app-admin-shell>

    <!-- ─── Coordination Calendar Overlay ─── -->
    @if (coordinationTarget()) {
      <app-flt-coordination-calendar
        [events]="coordinationCalendarEvents()"
        [eventTitle]="coordinationTarget()!.eventTitle"
        [saving]="coordSaving"
        [initial]="coordinationInitialSlot()"
        (saved)="saveCoordination($event)"
        (cancelled)="closeCoordination()"
      />
    }

    <!-- ─── Reschedule Calendar Overlay ─── (outside admin-shell so it covers full viewport) -->
    @if (rescheduleTarget()) {
      <app-flt-reschedule-calendar
        [events]="rescheduleApprovedEvents()"
        [initialSlots]="rescheduleInitialSlots()"
        [eventTitle]="rescheduleTarget()!.eventTitle"
        [saving]="rescheduleSaving"
        (saved)="saveReschedule($event)"
        (cancelled)="closeReschedule()"
      />
    }
  `,
})
export class FltReservations implements OnInit {
  private readonly svc  = inject(FltReservationsService);
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly apiError = signal(false);
  readonly reservations = signal<FltReservationRecord[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('All');
  readonly acting = signal<number | null>(null);
  readonly confirm = signal<ConfirmState | null>(null);
  readonly detailsTarget = signal<FltReservationRecord | null>(null);
  readonly showToast = signal(false);
  readonly toastMessage = signal('');
  readonly toastSuccess = signal(false);

  // Coordination modal
  readonly coordinationTarget = signal<{ id: number; eventTitle: string } | null>(null);
  readonly coordSaving = signal(false);

  // Reschedule calendar overlay
  readonly rescheduleTarget = signal<{ id: number; eventTitle: string } | null>(null);
  readonly rescheduleSaving = signal(false);

  /** Events to show on the reschedule calendar — all approved reservations/coordination EXCEPT the one being rescheduled */
  readonly rescheduleApprovedEvents = computed<RescheduleEvent[]>(() => {
    const target = this.rescheduleTarget();
    const events: RescheduleEvent[] = [];
    for (const r of this.reservations()) {
      if (r.status !== 'APPROVED') continue;
      if (r.id === target?.id) continue; // skip self
      try {
        const slots: ReservedDateSlot[] = JSON.parse(r.reservedDates);
        for (const s of slots) {
          events.push({ date: s.date, startTime: s.startTime, endTime: s.endTime, organization: r.organization, eventKind: 'RESERVATION' });
        }
      } catch { /* ignore */ }
      if (r.coordinationDate) {
        events.push({ date: r.coordinationDate, startTime: r.coordinationStartTime ?? '', endTime: r.coordinationEndTime ?? '', organization: r.organization, eventKind: 'COORDINATION' });
      }
    }
    return events;
  });

  /** Pre-populate the calendar basket with the current reservation's slots */
  readonly rescheduleInitialSlots = computed<ReservedDateSlot[]>(() => {
    const target = this.rescheduleTarget();
    if (!target) return [];
    const row = this.reservations().find(r => r.id === target.id);
    if (!row) return [];
    try { return JSON.parse(row.reservedDates); } catch { return []; }
  });

  /** Events shown inside the coordination calendar (exclude the coordination meeting of the target reservation) */
  readonly coordinationCalendarEvents = computed<RescheduleEvent[]>(() => {
    const target = this.coordinationTarget();
    return this.reservations()
      .filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED')
      .flatMap((r): RescheduleEvent[] => {
        const events: RescheduleEvent[] = [];
        try {
          const slots: Array<{ date: string; startTime: string; endTime: string }> = JSON.parse(r.reservedDates);
          for (const s of slots) {
            events.push({ date: s.date, startTime: s.startTime, endTime: s.endTime, organization: r.organization, eventKind: 'RESERVATION' });
          }
        } catch { /* skip */ }
        // Add the coordination meeting for all reservations except the one being edited
        if (r.coordinationDate && r.coordinationStartTime && r.coordinationEndTime && (!target || r.id !== target.id)) {
          events.push({ date: r.coordinationDate, startTime: r.coordinationStartTime, endTime: r.coordinationEndTime, organization: r.organization, eventKind: 'COORDINATION' });
        }
        return events;
      });
  });

  /** Pre-populate coordination calendar with existing coordination slot */
  readonly coordinationInitialSlot = computed<CoordinationSlot | null>(() => {
    const target = this.coordinationTarget();
    if (!target) return null;
    const row = this.reservations().find(r => r.id === target.id);
    if (!row?.coordinationDate || !row.coordinationStartTime || !row.coordinationEndTime) return null;
    return { date: row.coordinationDate, startTime: row.coordinationStartTime, endTime: row.coordinationEndTime };
  });

  readonly statusFilters = [...STATUS_FILTERS];

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const status = this.statusFilter();
    return this.reservations().filter(r => {
      const matchStatus = status === 'All' || r.status === status;
      const matchSearch =
        !q ||
        r.eventTitle.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.contactPerson.toLowerCase().includes(q) ||
        r.contactEmail.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.apiError.set(false);
    this.svc.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.reservations.set(res.reservations ?? []);
        } else {
          this.apiError.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.apiError.set(true);
        this.loading.set(false);
      },
    });
  }

  requestConfirm(row: FltReservationRecord, action: ReservationStatus): void {
    this.confirm.set({ id: row.id, action, eventTitle: row.eventTitle });
  }

  openDetails(row: FltReservationRecord): void {
    this.detailsTarget.set(row);
  }

  closeDetails(): void {
    this.detailsTarget.set(null);
  }

  executeAction(): void {
    const state = this.confirm();
    if (!state) return;

    this.acting.set(state.id);
    this.svc.updateStatus(state.id, state.action).subscribe({
      next: (res) => {
        this.acting.set(null);
        this.confirm.set(null);
        if (res.success) {
          this.reservations.update(list =>
            list.map(r => r.id === state.id ? { ...r, status: state.action } : r)
          );
          this.showResponse(true, `Reservation ${state.action.toLowerCase()} successfully.`);
        } else {
          this.showResponse(false, 'Action failed. Please try again.');
        }
      },
      error: () => {
        this.acting.set(null);
        this.confirm.set(null);
        this.showResponse(false, 'An error occurred. Please try again.');
      },
    });
  }

  // ─── Coordination ───────────────────────────────────────────────
  openCoordination(row: FltReservationRecord): void {
    this.coordinationTarget.set({ id: row.id, eventTitle: row.eventTitle });
  }

  closeCoordination(): void {
    this.coordinationTarget.set(null);
  }

  saveCoordination(slot: CoordinationSlot): void {
    const target = this.coordinationTarget();
    if (!target) return;
    this.coordSaving.set(true);
    const body: SetCoordinationRequest = { date: slot.date, startTime: slot.startTime, endTime: slot.endTime };
    this.svc.setCoordination(target.id, body).subscribe({
      next: (res) => {
        this.coordSaving.set(false);
        if (res.success) {
          this.reservations.update(list => list.map(r => r.id === target.id
            ? { ...r, coordinationDate: body.date, coordinationStartTime: body.startTime, coordinationEndTime: body.endTime }
            : r));
          this.showResponse(true, 'Coordination meeting saved.');
          this.closeCoordination();
        } else {
          this.showResponse(false, 'Failed to save coordination meeting.');
        }
      },
      error: () => { this.coordSaving.set(false); this.showResponse(false, 'An error occurred.'); },
    });
  }

  // ─── Reschedule ─────────────────────────────────────────────────
  openReschedule(row: FltReservationRecord): void {
    this.rescheduleTarget.set({ id: row.id, eventTitle: row.eventTitle });
  }

  closeReschedule(): void {
    this.rescheduleTarget.set(null);
  }

  saveReschedule(slots: ReservedDateSlot[]): void {
    const target = this.rescheduleTarget();
    if (!target || slots.length === 0) return;
    this.rescheduleSaving.set(true);
    this.svc.reschedule(target.id, slots).subscribe({
      next: (res) => {
        this.rescheduleSaving.set(false);
        if (res.success) {
          const newDates = JSON.stringify(slots);
          this.reservations.update(list => list.map(r => r.id === target.id ? { ...r, reservedDates: newDates } : r));
          this.showResponse(true, 'Reservation rescheduled successfully.');
          this.closeReschedule();
        } else {
          this.showResponse(false, 'Failed to reschedule reservation.');
        }
      },
      error: () => { this.rescheduleSaving.set(false); this.showResponse(false, 'An error occurred.'); },
    });
  }

  actionLabel(action: ReservationStatus | string): string {
    const map: Record<string, string> = {
      APPROVED: 'Approve', REJECTED: 'Reject', CANCELLED: 'Cancel', COMPLETED: 'Mark as Complete',
    };
    return map[action] ?? action;
  }

  private readonly ROOM_TYPE_LABELS: Record<string, string> = {
    flt_theater: 'FLT Theater',
    amphitheater: 'Amphitheater',
    banquet_hall: 'Banquet Hall',
  };

  getRoomTypeLabel(value: string | null): string {
    if (!value) return '—';
    return this.ROOM_TYPE_LABELS[value] ?? value;
  }

  parseDates(json: string): ReservedDateSlot[] {
    try { return JSON.parse(json) ?? []; } catch { return []; }
  }

  parseEquipment(json: string | null): RequestedEquipmentItem[] {
    if (!json) return [];
    try { return JSON.parse(json) ?? []; } catch { return []; }
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  }

  showResponse(success: boolean, message: string): void {
    this.toastSuccess.set(success);
    this.toastMessage.set(message);
    this.showToast.set(true);

    setTimeout(() => this.showToast.set(false), 3000);
  }

  async downloadReservationForm(row: FltReservationRecord): Promise<void> {
    if (!row.coordinationDate || !row.coordinationStartTime || !row.coordinationEndTime) {
      this.showResponse(false, 'Please set coordination meeting first before downloading.');
      return;
    }

    const slots      = this.parseDates(row.reservedDates);
    const equipment  = this.parseEquipment(row.requestedEquipment).map(e => e.name).join(', ') || '–';
    const slotDates  = slots.map(s => `${s.date}`).join(', ')                                   || '–';
    const slotTimes  = slots.map(s => `${s.startTime} – ${s.endTime}`).join(', ')               || '–';
    const room       = row.roomType ? this.getRoomTypeLabel(row.roomType) : '–';
    try {
      // Dynamic imports so these large libs are only loaded when needed
      const [PizZip, Docxtemplater] = await Promise.all([
        import('pizzip').then(m => m.default),
        import('docxtemplater').then(m => m.default),
      ]);

      const templateBuf = await firstValueFrom(
        this.http.get('/flt-reservation-template.docx', { responseType: 'arraybuffer' })
      );

      const zip = new PizZip(templateBuf);
      const templateDoc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      templateDoc.render({
        eventTitle:              String(row.eventTitle           ?? ''),
        eventType:               String(row.eventType            ?? ''),
        expectedAttendees:       String(row.expectedAttendees    ?? ''),
        eventDate:               slotDates,
        eventTime:               slotTimes,
        organizationDept:        `${row.organization ?? ''} / ${row.department ?? ''}`,
        contactPerson:           String(row.contactPerson        ?? ''),
        contactNumber:           String(row.contactNumber        ?? ''),
        contactEmail:            String(row.contactEmail         ?? ''),
        equipment:               equipment,
        additionalInstructions:  String(row.additionalInstructions ?? ''),
        coordinationDate:        String(row.coordinationDate       ?? ''),
        coordinationTime:        `${row.coordinationStartTime ?? ''} - ${row.coordinationEndTime ?? ''}`,
      });

      const out  = templateDoc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url  = URL.createObjectURL(out);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `FLT-Reservation-Form-${row.id}.docx`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showResponse(true, 'Reservation form downloaded.');
    } catch (err: any) {
      // docxtemplater wraps template errors in err.properties.errors
      const inner = err?.properties?.errors;
      if (inner?.length) {
        inner.forEach((e: any) => console.error('docxtemplater:', e.message, e.properties));
      } else {
        console.error('downloadReservationForm error', err);
      }
      this.showResponse(false, 'Failed to generate form: ' + (err?.message ?? 'unknown error'));
    }
  }

}
