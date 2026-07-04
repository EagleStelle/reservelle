import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AccountStatementResponse,
  CreateAccountRequest,
  PopulateUsersResponse,
  UpdateUserRequest,
  UserRow,
} from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list() {
    return this.http.get<UserRow[]>(`${this.base}/admin/users`).pipe(
      map((users): PopulateUsersResponse => ({ success: true, message: '', users })),
      catchError((err) => of(fail<PopulateUsersResponse>(err))),
    );
  }

  create(payload: CreateAccountRequest) {
    return this.http.post(`${this.base}/admin/createuser`, payload).pipe(
      map(() => ok('Account created')),
      catchError((err) => of(fail<AccountStatementResponse>(err))),
    );
  }

  update(payload: UpdateUserRequest) {
    return this.http.put(`${this.base}/admin/updateuser`, payload).pipe(
      map(() => ok('Account updated')),
      catchError((err) => of(fail<AccountStatementResponse>(err))),
    );
  }

  remove(empId: string) {
    return this.http.delete(`${this.base}/admin/deleteacc`, { params: { empId } }).pipe(
      map(() => ok('Account deleted')),
      catchError((err) => of(fail<AccountStatementResponse>(err))),
    );
  }

  toggleStatus(empId: string) {
    return this.http.patch(`${this.base}/admin/toggleaccstat`, {}, { params: { empId } }).pipe(
      map(() => ok('Status updated')),
      catchError((err) => of(fail<AccountStatementResponse>(err))),
    );
  }
}

function ok(message: string): AccountStatementResponse {
  return { success: true, message };
}

function fail<T extends { success: boolean; message: string }>(err: any): T {
  return { success: false, message: err?.error?.message ?? 'Request failed' } as T;
}
