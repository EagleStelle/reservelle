import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { UiButton, UiCheckbox, UiIcon, UiInput, UiLabel } from '../../../../shared/ui';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, UiButton, UiInput, UiCheckbox, UiLabel, UiIcon],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

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
        if (res.success) {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.error.set(res.message || 'Login failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Unable to reach the server');
      },
    });
  }
}
