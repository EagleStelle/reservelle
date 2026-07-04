using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Models;

namespace Reservelle.Api.Data;

// Idempotent startup seeding: only inserts when data is missing.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedFacilitiesAsync(db);
        await SeedAdminAsync(db);
    }

    private static async Task SeedFacilitiesAsync(AppDbContext db)
    {
        var required = new[]
        {
            "Boardroom",
            "Vans",
            "Conference Room",
            "Gymnasium",
            "Nexus Room",
            "FLT",
        };

        var existing = await db.Facilities
            .Select(f => f.FacilityName)
            .ToListAsync();

        foreach (var facilityName in required)
        {
            if (existing.Any(name => string.Equals(name, facilityName, StringComparison.OrdinalIgnoreCase)))
                continue;

            db.Facilities.Add(new Facility { FacilityName = facilityName });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedAdminAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync(u => u.Username == "admin")) return;

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
