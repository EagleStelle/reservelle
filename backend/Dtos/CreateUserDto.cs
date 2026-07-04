namespace Reservelle.Api.Dtos;

// Body of POST /admin/createuser. "passwordHash" is actually the raw password
// (legacy field name); the backend hashes it with BCrypt before storing.
public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
}
