using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
using Reservelle.Api.Models;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    // GET /api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .OrderBy(u => u.Id)
            .Select(u => ToDto(u))
            .ToListAsync();

        return Ok(users);
    }

    // POST /api/admin/createuser
    [HttpPost("createuser")]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { message = "Username already taken." });
        if (await _db.Users.AnyAsync(u => u.EmployeeId == dto.EmployeeId))
            return Conflict(new { message = "Employee ID already in use." });

        var user = new User
        {
            Username = dto.Username,
            FullName = dto.Fullname,
            Email = dto.Email,
            EmployeeId = dto.EmployeeId,
            Role = dto.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash),
            Status = NormalizeStatus(dto.Status),
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), ToDto(user));
    }

    // PUT /api/admin/updateuser
    [HttpPut("updateuser")]
    public async Task<IActionResult> UpdateUser(UpdateUserDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmployeeId == dto.OldEmployeeId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        // Guard uniqueness only when the value actually changed.
        if (dto.EmployeeId != user.EmployeeId &&
            await _db.Users.AnyAsync(u => u.EmployeeId == dto.EmployeeId))
            return Conflict(new { message = "Employee ID already in use." });
        if (dto.Username != user.Username &&
            await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { message = "Username already taken." });

        user.EmployeeId = dto.EmployeeId;
        user.FullName = dto.Fullname;
        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Role = dto.Role;
        await _db.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    // DELETE /api/admin/deleteacc?empId=ADMIN-001
    [HttpDelete("deleteacc")]
    public async Task<IActionResult> DeleteAccount([FromQuery] string empId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmployeeId == empId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/toggleaccstat?empId=ADMIN-001
    [HttpPatch("toggleaccstat")]
    public async Task<IActionResult> ToggleAccountStatus([FromQuery] string empId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmployeeId == empId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        user.Status = IsActive(user.Status) ? "inactive" : "active";
        await _db.SaveChangesAsync();
        return Ok(new { employeeId = user.EmployeeId, status = user.Status });
    }

    private static bool IsActive(string status) =>
        status.Equals("active", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeStatus(string? status) =>
        string.IsNullOrWhiteSpace(status) ? "active" : status.Trim().ToLowerInvariant();

    private static UserDto ToDto(User u) => new()
    {
        Username = u.Username,
        Fullname = u.FullName,
        Role = u.Role,
        Email = u.Email,
        EmployeeId = u.EmployeeId,
        Status = u.Status,
    };
}
