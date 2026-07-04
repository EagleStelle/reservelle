using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
using Reservelle.Api.Models;
using Reservelle.Api.Services;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _tokens;

    public AuthController(AppDbContext db, JwtTokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);

        // 401: same message whether user or password is wrong (don't leak which).
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password" });

        // 403: credentials were correct, but the account is disabled.
        if (!string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account is inactive" });

        return Ok(new LoginResponse
        {
            Token = _tokens.CreateToken(user),
            User = ToDto(user),
        });
    }

    // GET /api/auth/me — requires a valid token; echoes the current user.
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new AuthUserDto
    {
        Username = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
        Role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
        Email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
        Fullname = User.FindFirstValue("fullname") ?? string.Empty,
        EmpId = User.FindFirstValue("empId") ?? string.Empty,
    });

    private static AuthUserDto ToDto(User u) => new()
    {
        Username = u.Username,
        Role = u.Role,
        Email = u.Email,
        Fullname = u.FullName,
        EmpId = u.EmployeeId,
    };
}
