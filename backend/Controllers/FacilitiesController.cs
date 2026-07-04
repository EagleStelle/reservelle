using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class FacilitiesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FacilitiesController(AppDbContext db) => _db = db;

    // GET /api/admin/facility
    [HttpGet("facility")]
    public async Task<IActionResult> GetFacilities()
    {
        var facilities = await _db.Facilities
            .OrderBy(f => f.Id)
            .Select(f => new FacilityDto
            {
                Id = f.Id,
                FacilityName = f.FacilityName,
            })
            .ToListAsync();

        return Ok(facilities);
    }
}
