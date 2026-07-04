using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Models;

namespace Reservelle.Api.Data;

// EF Core gateway to the database; one DbSet<T> per table.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Enforce unique logins and employee IDs at the database level.
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.EmployeeId).IsUnique();
        modelBuilder.Entity<Reservation>().HasIndex(r => new { r.FacilityId, r.Status });
    }
}
