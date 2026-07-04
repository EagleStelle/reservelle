using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;

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
            .Select(v => new VehicleDto
            {
                Id = v.Id,
                Brand = v.Brand,
                PlateNum = v.PlateNumber,
                Capacity = v.Capacity,
                VehicleDescription = v.Description,
                Status = v.Status,
                FacilityId = v.FacilityId,
                FacilityName = v.Facility.FacilityName,
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Vehicles loaded", vehicles });
    }
}
