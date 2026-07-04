using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
using Reservelle.Api.Models;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class EquipmentController : ControllerBase
{
    private readonly AppDbContext _db;

    public EquipmentController(AppDbContext db) => _db = db;

    // GET /api/admin/equipment
    [HttpGet("equipment")]
    public async Task<IActionResult> GetEquipment()
    {
        var equipment = await _db.Equipment
            .OrderBy(e => e.Id)
            .Select(e => ToDto(e, e.Facility.FacilityName))
            .ToListAsync();

        return Ok(equipment);
    }

    // POST /api/admin/createequipment
    [HttpPost("createequipment")]
    public async Task<IActionResult> CreateEquipment(CreateEquipmentDto dto)
    {
        if (!await _db.Facilities.AnyAsync(f => f.Id == dto.FacilityId))
            return BadRequest(new { message = "Facility not found." });

        var equipment = new Equipment
        {
            Name = dto.Name,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "ACTIVE" : dto.Status,
            FacilityId = dto.FacilityId,
        };
        _db.Equipment.Add(equipment);
        await _db.SaveChangesAsync();

        var facilityName = await FacilityName(equipment.FacilityId);
        return CreatedAtAction(nameof(GetEquipment), ToDto(equipment, facilityName));
    }

    // PUT /api/admin/updateequipment
    [HttpPut("updateequipment")]
    public async Task<IActionResult> UpdateEquipment(UpdateEquipmentDto dto)
    {
        var equipment = await _db.Equipment.FindAsync(dto.Id);
        if (equipment is null)
            return NotFound(new { message = "Equipment not found." });

        if (!await _db.Facilities.AnyAsync(f => f.Id == dto.FacilityId))
            return BadRequest(new { message = "Facility not found." });

        equipment.Name = dto.Name;
        equipment.Status = dto.Status;
        equipment.FacilityId = dto.FacilityId;
        await _db.SaveChangesAsync();

        return Ok(ToDto(equipment, await FacilityName(equipment.FacilityId)));
    }

    // DELETE /api/admin/deleteequipment?id=123
    [HttpDelete("deleteequipment")]
    public async Task<IActionResult> DeleteEquipment([FromQuery] int id)
    {
        var equipment = await _db.Equipment.FindAsync(id);
        if (equipment is null)
            return NotFound(new { message = "Equipment not found." });

        _db.Equipment.Remove(equipment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/toggleequipmentstat?id=123
    [HttpPatch("toggleequipmentstat")]
    public async Task<IActionResult> ToggleEquipmentStatus([FromQuery] int id)
    {
        var equipment = await _db.Equipment.FindAsync(id);
        if (equipment is null)
            return NotFound(new { message = "Equipment not found." });

        equipment.Status = equipment.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase)
            ? "INACTIVE" : "ACTIVE";
        await _db.SaveChangesAsync();
        return Ok(new { id = equipment.Id, status = equipment.Status });
    }

    private Task<string?> FacilityName(int facilityId) => _db.Facilities
        .Where(f => f.Id == facilityId)
        .Select(f => f.FacilityName)
        .FirstOrDefaultAsync();

    private static EquipmentDto ToDto(Equipment e, string? facilityName) => new()
    {
        Id = e.Id,
        Name = e.Name,
        Status = e.Status,
        FacilityId = e.FacilityId,
        FacilityName = facilityName,
    };
}
