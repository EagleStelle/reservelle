namespace Reservelle.Api.Dtos;

// Matches the frontend's UserRow. Never includes the password hash.
public class UserDto
{
    public string Username { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
