namespace Reservelle.Api.Dtos;

// Body of PUT /admin/updateuser. Looks the account up by OldEmployeeId (which
// may itself be changed). Password is not updated here.
public class UpdateUserDto
{
    public string OldEmployeeId { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
