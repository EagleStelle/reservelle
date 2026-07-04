export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  role: string;
  email: string;
  fullname: string;
  empId: string;
}

// 200 body from POST /auth/login. Failures come back as HTTP errors (401/403).
export interface LoginResponse {
  token: string;
  user: AuthUser;
}
