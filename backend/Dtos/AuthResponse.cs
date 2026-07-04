namespace Reservelle.Api.Dtos;

// Returned by /auth/login and /auth/me. Field names match the frontend.
public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string EmpId { get; set; } = string.Empty;
}
