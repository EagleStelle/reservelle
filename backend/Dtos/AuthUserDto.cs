namespace Reservelle.Api.Dtos;

// The current user, as returned by /auth/me and nested in the login response.
public class AuthUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string EmpId { get; set; } = string.Empty;
}
