import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ThemeService, type Theme } from '../../../../core/theme/theme.service';
import { UiButton, UiCheckbox, UiIcon, UiInput, UiLabel } from '../../../../shared/ui';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, UiButton, UiInput, UiCheckbox, UiLabel, UiIcon],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  // Login is always shown in light mode; restore the user's theme on leave.
  private readonly previousTheme: Theme = this.themeService.theme();

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  constructor() {
    this.themeService.set('light');
  }

  ngOnDestroy(): void {
    this.themeService.set(this.previousTheme);
  }

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ username, password }).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (!res?.success) {
          this.error.set(res?.message ?? 'Login failed');
          return;
        }

        switch (res.role?.toUpperCase()) {
          case 'SUPERADMIN':
            this.router.navigateByUrl('/dashboard');
            break;

          case 'NEXUSADMIN':
            this.router.navigateByUrl('/nexus/dashboard');
            break;

          case 'FACILITIESADMIN':
            this.router.navigateByUrl('/facilities/dashboard');
            break;

          case 'EOADMIN':
            this.router.navigateByUrl('/eo/dashboard');
            break;

          default:
            this.error.set(`Unknown role: ${res.role}`);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Unable to reach the server');
      },
    });
  }
}
