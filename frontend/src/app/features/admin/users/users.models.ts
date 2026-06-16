export interface UserRow {
  id: number;
  username: string;
  fullname: string;
  role: string;
  email: string;
  employeeId: string;
  status: string;
}

export interface PopulateUsersResponse {
  success: boolean;
  message: string;
  users: UserRow[];
}

export interface CreateAccountRequest {
  username: string;
  fullname: string;
  role: string;
  email: string;
  employeeId: string;
  passwordHash: string;
  status: string;
}

export interface AccountStatementResponse {
  success: boolean;
  message: string;
}
