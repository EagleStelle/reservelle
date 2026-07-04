using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
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

        // Same message whether user or password is wrong (don't leak which).
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Ok(new AuthResponse { Success = false, Message = "Invalid username or password" });

        if (user.Status != "active")
            return Ok(new AuthResponse { Success = false, Message = "Account is inactive" });

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            Role = user.Role,
            Username = user.Username,
            Token = _tokens.CreateToken(user),
            Email = user.Email,
            Fullname = user.FullName,
            EmpId = user.EmployeeId,
        });
    }

    // GET /api/auth/me — requires a valid token; echoes the current user.
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new AuthResponse
    {
        Success = true,
        Message = "OK",
        Role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
        Username = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
        Email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
        Fullname = User.FindFirstValue("fullname") ?? string.Empty,
        EmpId = User.FindFirstValue("empId") ?? string.Empty,
    });
}
