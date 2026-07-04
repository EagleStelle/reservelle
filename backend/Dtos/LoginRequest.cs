namespace Reservelle.Api.Dtos;

// Body of POST /auth/login.
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
