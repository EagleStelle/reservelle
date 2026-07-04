using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Models;

namespace Reservelle.Api.Data;

// Idempotent startup seeding: only inserts when data is missing.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.Users.AnyAsync(u => u.Username == "admin"))
        {
            db.Users.Add(new User
            {
                Username = "admin",
                FullName = "Administrator",
                Email = "admin@lpu.edu.ph",
                EmployeeId = "ADMIN-001",
                Role = "SUPERADMIN",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Status = "active",
            });
            await db.SaveChangesAsync();
        }
    }
}
