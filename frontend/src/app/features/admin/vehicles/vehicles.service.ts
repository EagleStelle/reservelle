import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CreateVehicleRequest,
  PopulateVehiclesResponse,
  UpdateVehicleRequest,
  VehicleRow,
  VehicleStatementResponse,
} from './vehicles.models';

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Backend returns a bare array; adapt to the envelope the UI expects.
  list() {
    return this.http.get<VehicleRow[]>(`${this.base}/admin/vehicle`).pipe(
      map((vehicles): PopulateVehiclesResponse => ({ success: true, message: '', vehicles })),
      catchError((err) => of(fail<PopulateVehiclesResponse>(err))),
    );
  }

  create(payload: CreateVehicleRequest) {
    const body = {
      brand: payload.brand,
      plate_num: payload.plate_num,
      capacity: payload.capacity,
      vehicleDescription: payload.vehicleDescription,
      status: payload.status,
    };
    return this.http.post(`${this.base}/admin/createvehicle`, body).pipe(
      map(() => ok('Vehicle created')),
      catchError((err) => of(fail<VehicleStatementResponse>(err))),
    );
  }

  update(payload: UpdateVehicleRequest) {
    const body = {
      id: payload.id,
      facilityId: payload.facilityId,
      brand: payload.brand,
      plate_num: payload.plate_num,
      capacity: payload.capacity,
      vehicleDescription: payload.vehicleDescription,
      status: payload.status,
    };
    return this.http.put(`${this.base}/admin/updatevehicle`, body).pipe(
      map(() => ok('Vehicle updated')),
      catchError((err) => of(fail<VehicleStatementResponse>(err))),
    );
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/admin/deletevehicle`, { params: { id } }).pipe(
      map(() => ok('Vehicle deleted')),
      catchError((err) => of(fail<VehicleStatementResponse>(err))),
    );
  }

  toggleStatus(id: number) {
    return this.http.patch(`${this.base}/admin/togglevehicle`, {}, { params: { id } }).pipe(
      map(() => ok('Status updated')),
      catchError((err) => of(fail<VehicleStatementResponse>(err))),
    );
  }
}

function ok(message: string): VehicleStatementResponse {
  return { success: true, message };
}

function fail<T extends { success: boolean; message: string }>(err: any): T {
  return { success: false, message: err?.error?.message ?? 'Request failed' } as T;
}
