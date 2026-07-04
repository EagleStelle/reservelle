namespace Reservelle.Api.Dtos;

// 200 response for a successful login.
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public AuthUserDto User { get; set; } = new();
}
