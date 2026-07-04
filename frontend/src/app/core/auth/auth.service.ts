import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from './auth.models';

const TOKEN_KEY = 'lpul_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly base = environment.apiUrl;

  readonly token = signal<string | null>(this.readToken());
  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  // Success resolves with the token + user; bad credentials surface as an HTTP error.
  login(payload: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.base}/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  /** Validate the stored token and refresh the current user. Errors if invalid. */
  me() {
    return this.http
      .get<AuthUser>(`${this.base}/auth/me`)
      .pipe(tap((user) => this.user.set(user)));
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
  }

  private setSession(res: LoginResponse) {
    this.token.set(res.token);
    this.user.set(res.user);
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, res.token);
  }

  private readToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }
}
