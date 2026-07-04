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
        if (await db.Facilities.AnyAsync()) return;

        // Insertion order sets the auto-increment ids; Vans is 2 to match the
        // frontend's VAN_FACILITY_ID constant (we'll harden this later).
        db.Facilities.AddRange(
            new Facility { FacilityName = "Boardroom" },
            new Facility { FacilityName = "Vans" },
            new Facility { FacilityName = "Conference Room" },
            new Facility { FacilityName = "Gymnasium" },
            new Facility { FacilityName = "Nexus Room" },
            new Facility { FacilityName = "FLT" });
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
