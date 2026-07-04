namespace Reservelle.Api.Models;

// An account. Username and EmployeeId are unique (see AppDbContext config).
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Role { get; set; } = "customer";   // "admin" or "customer"
    public string PasswordHash { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
}
