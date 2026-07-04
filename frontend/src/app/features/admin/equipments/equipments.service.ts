import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CreateEquipmentRequest,
  EquipmentRow,
  EquipmentStatementResponse,
  Facility,
  PopulateEquipmentsResponse,
  UpdateEquipmentRequest,
} from './equipments.models';

@Injectable({ providedIn: 'root' })
export class EquipmentsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list() {
    return this.http.get<EquipmentRow[]>(`${this.base}/admin/equipment`).pipe(
      map((equipment): PopulateEquipmentsResponse => ({ success: true, message: '', equipment })),
      catchError((err) => of(fail<PopulateEquipmentsResponse>(err))),
    );
  }

  // Backend already returns a bare Facility[]; no adaptation needed.
  listFacilities() {
    return this.http.get<Facility[]>(`${this.base}/admin/facility`);
  }

  create(payload: CreateEquipmentRequest) {
    return this.http.post(`${this.base}/admin/createequipment`, payload).pipe(
      map(() => ok('Equipment created')),
      catchError((err) => of(fail<EquipmentStatementResponse>(err))),
    );
  }

  update(payload: UpdateEquipmentRequest) {
    return this.http.put(`${this.base}/admin/updateequipment`, payload).pipe(
      map(() => ok('Equipment updated')),
      catchError((err) => of(fail<EquipmentStatementResponse>(err))),
    );
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/admin/deleteequipment`, { params: { id } }).pipe(
      map(() => ok('Equipment deleted')),
      catchError((err) => of(fail<EquipmentStatementResponse>(err))),
    );
  }

  toggleStatus(id: number) {
    return this.http.patch(`${this.base}/admin/toggleequipmentstat`, {}, { params: { id } }).pipe(
      map(() => ok('Status updated')),
      catchError((err) => of(fail<EquipmentStatementResponse>(err))),
    );
  }
}

function ok(message: string): EquipmentStatementResponse {
  return { success: true, message };
}

function fail<T extends { success: boolean; message: string }>(err: any): T {
  return { success: false, message: err?.error?.message ?? 'Request failed' } as T;
}
