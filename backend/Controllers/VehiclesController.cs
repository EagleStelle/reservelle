using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
using Reservelle.Api.Models;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class VehiclesController : ControllerBase
{
    private readonly AppDbContext _db;

    public VehiclesController(AppDbContext db) => _db = db;

    // GET /api/admin/vehicle
    [HttpGet("vehicle")]
    public async Task<IActionResult> GetVehicles()
    {
        var vehicles = await _db.Vehicles
            .OrderBy(v => v.Id)
            .Select(v => ToDto(v, v.Facility.FacilityName))
            .ToListAsync();

        return Ok(vehicles);
    }

    // POST /api/admin/createvehicle
    [HttpPost("createvehicle")]
    public async Task<IActionResult> CreateVehicle(CreateVehicleDto dto)
    {
        // Vehicles live under the "Vans" facility (looked up by name, not a magic id).
        var vans = await _db.Facilities.FirstOrDefaultAsync(f => f.FacilityName == "Vans");
        if (vans is null)
            return Problem("The 'Vans' facility is missing.");

        if (await _db.Vehicles.AnyAsync(v => v.PlateNumber == dto.PlateNum))
            return Conflict(new { message = "A vehicle with that plate number already exists." });

        var vehicle = new Vehicle
        {
            Brand = dto.Brand,
            PlateNumber = dto.PlateNum,
            Capacity = dto.Capacity,
            Description = dto.VehicleDescription,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "active" : dto.Status,
            FacilityId = vans.Id,
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicles), ToDto(vehicle, vans.FacilityName));
    }

    // PUT /api/admin/updatevehicle
    [HttpPut("updatevehicle")]
    public async Task<IActionResult> UpdateVehicle(UpdateVehicleDto dto)
    {
        var vehicle = await _db.Vehicles.FindAsync(dto.Id);
        if (vehicle is null)
            return NotFound(new { message = "Vehicle not found." });

        vehicle.Brand = dto.Brand;
        vehicle.PlateNumber = dto.PlateNum;
        vehicle.Capacity = dto.Capacity;
        vehicle.Description = dto.VehicleDescription;
        vehicle.Status = dto.Status;
        vehicle.FacilityId = dto.FacilityId;
        await _db.SaveChangesAsync();

        var facilityName = await _db.Facilities
            .Where(f => f.Id == vehicle.FacilityId)
            .Select(f => f.FacilityName)
            .FirstOrDefaultAsync();

        return Ok(ToDto(vehicle, facilityName));
    }

    // DELETE /api/admin/deletevehicle?id=123
    [HttpDelete("deletevehicle")]
    public async Task<IActionResult> DeleteVehicle([FromQuery] int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null)
            return NotFound(new { message = "Vehicle not found." });

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/togglevehicle?id=123
    [HttpPatch("togglevehicle")]
    public async Task<IActionResult> ToggleVehicleStatus([FromQuery] int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null)
            return NotFound(new { message = "Vehicle not found." });

        vehicle.Status = vehicle.Status == "active" ? "inactive" : "active";
        await _db.SaveChangesAsync();
        return Ok(new { id = vehicle.Id, status = vehicle.Status });
    }

    private static VehicleDto ToDto(Vehicle v, string? facilityName) => new()
    {
        Id = v.Id,
        Brand = v.Brand,
        PlateNum = v.PlateNumber,
        Capacity = v.Capacity,
        VehicleDescription = v.Description,
        Status = v.Status,
        FacilityId = v.FacilityId,
        FacilityName = facilityName,
    };
}
