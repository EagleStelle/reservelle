using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservelle.Api.Data;
using Reservelle.Api.Dtos;
using Reservelle.Api.Models;

namespace Reservelle.Api.Controllers;

[ApiController]
[Route("api")]
public class FltReservationsController : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "COMPLETED",
    };

    private readonly AppDbContext _db;

    public FltReservationsController(AppDbContext db) => _db = db;

    // GET /api/public/flt/equipment
    [HttpGet("public/flt/equipment")]
    public async Task<IActionResult> GetPublicEquipment()
    {
        var facilityId = await GetFltFacilityIdAsync();
        if (facilityId is null)
            return Ok(new { success = true, message = "Equipment loaded.", equipment = Array.Empty<FltEquipmentItemDto>() });

        var equipment = await _db.Equipment
            .Where(e => e.FacilityId == facilityId && e.Status.ToUpper() == "ACTIVE")
            .OrderBy(e => e.Name)
            .Select(e => new FltEquipmentItemDto
            {
                Id = e.Id,
                Name = e.Name,
                Status = e.Status,
                FacilityId = e.FacilityId,
                FacilityName = e.Facility.FacilityName,
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Equipment loaded.", equipment });
    }

    // GET /api/public/flt/occupied-dates
    [HttpGet("public/flt/occupied-dates")]
    public async Task<IActionResult> GetOccupiedDates()
    {
        var rows = await GetBlockingFltReservationsAsync();
        var occupiedDates = rows
            .SelectMany(ReservationSlots)
            .Select(s => s.Date)
            .Concat(rows
                .Where(r => r.CoordinationDate is not null)
                .Select(r => FormatDate(r.CoordinationDate!.Value)))
            .Distinct()
            .Order()
            .ToList();

        return Ok(new { success = true, message = "Occupied dates loaded.", occupiedDates });
    }

    // GET /api/public/flt/approved-events
    [HttpGet("public/flt/approved-events")]
    public async Task<IActionResult> GetApprovedEvents()
    {
        var rows = await GetBlockingFltReservationsAsync();
        var approvedEvents = new List<FltApprovedEventDto>();

        foreach (var row in rows)
        {
            approvedEvents.AddRange(ReservationSlots(row).Select(slot => new FltApprovedEventDto
            {
                EventTitle = row.EventName,
                Organization = row.Organization,
                Date = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                EventKind = "RESERVATION",
            }));

            if (row.CoordinationDate is not null &&
                row.CoordinationStartTime is not null &&
                row.CoordinationEndTime is not null)
            {
                approvedEvents.Add(new FltApprovedEventDto
                {
                    EventTitle = row.EventName,
                    Organization = row.Organization,
                    Date = FormatDate(row.CoordinationDate.Value),
                    StartTime = FormatTime(row.CoordinationStartTime.Value),
                    EndTime = FormatTime(row.CoordinationEndTime.Value),
                    EventKind = "COORDINATION",
                });
            }
        }

        return Ok(new { success = true, message = "Approved events loaded.", approvedEvents });
    }

    // POST /api/public/flt/reserve
    [HttpPost("public/flt/reserve")]
    public async Task<IActionResult> SubmitReservation(FltReservationPayloadDto dto)
    {
        var validation = NormalizeSlots(dto.ReservedDates);
        if (!validation.Success)
            return ApiFailure(validation.Message);

        if (string.IsNullOrWhiteSpace(dto.EventTitle) ||
            string.IsNullOrWhiteSpace(dto.ContactPerson) ||
            string.IsNullOrWhiteSpace(dto.ContactEmail))
        {
            return ApiFailure("Event title and contact details are required.");
        }

        var conflict = await FindConflictAsync(validation.Slots);
        if (conflict is not null)
            return ApiFailure(conflict);

        var facility = await EnsureFltFacilityAsync();
        var equipment = await GetRequestedEquipmentAsync(dto.RequestedEquipment, facility.Id);
        if (equipment.MissingIds.Count > 0)
            return ApiFailure($"Equipment not found or unavailable: {string.Join(", ", equipment.MissingIds)}.");

        var requestedEquipment = equipment.Items.Select(e => new RequestedEquipmentItemDto
        {
            Id = e.Id,
            Name = e.Name ?? string.Empty,
        }).ToList();

        var reservation = new Reservation
        {
            EventName = dto.EventTitle.Trim(),
            EventType = dto.EventType.Trim(),
            Department = dto.Department.Trim(),
            Organization = dto.Organization.Trim(),
            Headcount = dto.ExpectedAttendees,
            ContactPerson = dto.ContactPerson.Trim(),
            ContactEmail = dto.ContactEmail.Trim(),
            ContactNumber = dto.ContactNumber.Trim(),
            Remarks = dto.AdditionalInstructions?.Trim(),
            ReservedDatesJson = SerializeSlots(validation.Slots),
            RequestedEquipmentJson = SerializeEquipment(requestedEquipment),
            RoomType = dto.RoomType.Trim(),
            Status = "PENDING",
            FacilityId = facility.Id,
            CreatedAt = DateTime.UtcNow,
        };

        ApplyDateRange(reservation, validation.Slots);
        foreach (var item in equipment.Items)
            reservation.Equipment.Add(item);

        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Reservation submitted successfully." });
    }

    // GET /api/admin/flt/reservations
    [HttpGet("admin/flt/reservations")]
    public async Task<IActionResult> GetAdminReservations()
    {
        var facilityId = await GetFltFacilityIdAsync();
        if (facilityId is null)
            return Ok(new { success = true, message = "Reservations loaded.", reservations = Array.Empty<FltReservationRecordDto>() });

        var rows = await _db.Reservations
            .Where(r => r.FacilityId == facilityId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reservations = rows.Select(ToRecord).ToList();
        return Ok(new { success = true, message = "Reservations loaded.", reservations });
    }

    // PATCH /api/admin/flt/reservations/{id}/status?status=APPROVED
    [HttpPatch("admin/flt/reservations/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var normalizedStatus = NormalizeStatus(status);
        if (!AllowedStatuses.Contains(normalizedStatus))
            return ApiFailure("Invalid reservation status.");

        var reservation = await FindFltReservationAsync(id);
        if (reservation is null)
            return ApiFailure("Reservation not found.");

        if (normalizedStatus == "APPROVED")
        {
            var conflict = await FindConflictAsync(
                ReservationSlots(reservation),
                excludeReservationSlotsForId: reservation.Id);

            if (conflict is not null)
                return ApiFailure(conflict);
        }

        reservation.Status = normalizedStatus;
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Reservation status updated." });
    }

    // POST /api/admin/flt/reservations/{id}/coordination
    [HttpPost("admin/flt/reservations/{id:int}/coordination")]
    public async Task<IActionResult> SetCoordination(int id, SetFltCoordinationDto dto)
    {
        var reservation = await FindFltReservationAsync(id);
        if (reservation is null)
            return ApiFailure("Reservation not found.");

        var validation = NormalizeSlots([
            new ReservedDateSlotDto
            {
                Date = dto.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
            },
        ]);

        if (!validation.Success)
            return ApiFailure(validation.Message);

        var conflict = await FindConflictAsync(
            validation.Slots,
            excludeCoordinationSlotForId: reservation.Id);

        if (conflict is not null)
            return ApiFailure(conflict);

        var slot = validation.Slots[0];
        reservation.CoordinationDate = ParseDate(slot.Date);
        reservation.CoordinationStartTime = ParseTime(slot.StartTime);
        reservation.CoordinationEndTime = ParseTime(slot.EndTime);

        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Coordination meeting saved." });
    }

    // PUT /api/admin/flt/reservations/{id}/reschedule
    [HttpPut("admin/flt/reservations/{id:int}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, RescheduleFltReservationDto dto)
    {
        var reservation = await FindFltReservationAsync(id);
        if (reservation is null)
            return ApiFailure("Reservation not found.");

        var validation = NormalizeSlots(dto.ReservedDates);
        if (!validation.Success)
            return ApiFailure(validation.Message);

        var conflict = await FindConflictAsync(
            validation.Slots,
            excludeReservationSlotsForId: reservation.Id);

        if (conflict is not null)
            return ApiFailure(conflict);

        reservation.ReservedDatesJson = SerializeSlots(validation.Slots);
        ApplyDateRange(reservation, validation.Slots);

        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Reservation rescheduled." });
    }

    private async Task<int?> GetFltFacilityIdAsync()
    {
        var facility = await _db.Facilities
            .OrderBy(f => f.Id)
            .FirstOrDefaultAsync(f => f.FacilityName != null && f.FacilityName.ToUpper().Contains("FLT"));

        return facility?.Id;
    }

    private async Task<Facility> EnsureFltFacilityAsync()
    {
        var facility = await _db.Facilities
            .OrderBy(f => f.Id)
            .FirstOrDefaultAsync(f => f.FacilityName != null && f.FacilityName.ToUpper().Contains("FLT"));

        if (facility is not null)
            return facility;

        facility = new Facility { FacilityName = "FLT" };
        _db.Facilities.Add(facility);
        await _db.SaveChangesAsync();
        return facility;
    }

    private async Task<Reservation?> FindFltReservationAsync(int id)
    {
        var facilityId = await GetFltFacilityIdAsync();
        if (facilityId is null) return null;

        return await _db.Reservations
            .FirstOrDefaultAsync(r => r.Id == id && r.FacilityId == facilityId);
    }

    private async Task<List<Reservation>> GetBlockingFltReservationsAsync()
    {
        var facilityId = await GetFltFacilityIdAsync();
        if (facilityId is null) return [];

        return await _db.Reservations
            .Where(r => r.FacilityId == facilityId)
            .Where(r => r.Status.ToUpper() == "APPROVED" || r.Status.ToUpper() == "COMPLETED")
            .OrderBy(r => r.StartDate)
            .ThenBy(r => r.StartTime)
            .ToListAsync();
    }

    private async Task<string?> FindConflictAsync(
        IReadOnlyCollection<ReservedDateSlotDto> slots,
        int? excludeReservationSlotsForId = null,
        int? excludeCoordinationSlotForId = null)
    {
        var blocking = await GetBlockingFltReservationsAsync();

        foreach (var row in blocking)
        {
            if (row.Id != excludeReservationSlotsForId)
            {
                foreach (var existing in ReservationSlots(row))
                {
                    if (slots.Any(slot => Overlaps(slot, existing)))
                        return $"Selected schedule conflicts with an existing reservation for {row.EventName}.";
                }
            }

            if (row.Id != excludeCoordinationSlotForId &&
                row.CoordinationDate is not null &&
                row.CoordinationStartTime is not null &&
                row.CoordinationEndTime is not null)
            {
                var coordination = new ReservedDateSlotDto
                {
                    Date = FormatDate(row.CoordinationDate.Value),
                    StartTime = FormatTime(row.CoordinationStartTime.Value),
                    EndTime = FormatTime(row.CoordinationEndTime.Value),
                };

                if (slots.Any(slot => Overlaps(slot, coordination)))
                    return $"Selected schedule conflicts with a coordination meeting for {row.EventName}.";
            }
        }

        return null;
    }

    private async Task<(List<Equipment> Items, List<int> MissingIds)> GetRequestedEquipmentAsync(
        List<RequestedEquipmentItemDto> requested,
        int facilityId)
    {
        var requestedIds = requested
            .Select(e => e.Id)
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (requestedIds.Count == 0)
            return ([], []);

        var equipment = await _db.Equipment
            .Where(e => requestedIds.Contains(e.Id))
            .Where(e => e.FacilityId == facilityId && e.Status.ToUpper() == "ACTIVE")
            .ToListAsync();

        var foundIds = equipment.Select(e => e.Id).ToHashSet();
        var missing = requestedIds.Where(id => !foundIds.Contains(id)).ToList();
        return (equipment, missing);
    }

    private static FltReservationRecordDto ToRecord(Reservation row) => new()
    {
        Id = row.Id,
        EventTitle = row.EventName,
        EventType = row.EventType,
        Department = row.Department,
        Organization = row.Organization,
        ContactPerson = row.ContactPerson,
        ContactEmail = row.ContactEmail,
        ContactNumber = row.ContactNumber,
        ReservedDates = HasReservationSlotsJson(row)
            ? row.ReservedDatesJson
            : SerializeSlots(ReservationSlots(row)),
        RequestedEquipment = row.RequestedEquipmentJson,
        RoomType = row.RoomType,
        ExpectedAttendees = row.Headcount > 0 ? row.Headcount.ToString(CultureInfo.InvariantCulture) : null,
        CoordinationDate = row.CoordinationDate is null ? null : FormatDate(row.CoordinationDate.Value),
        CoordinationStartTime = row.CoordinationStartTime is null ? null : FormatTime(row.CoordinationStartTime.Value),
        CoordinationEndTime = row.CoordinationEndTime is null ? null : FormatTime(row.CoordinationEndTime.Value),
        AdditionalInstructions = row.Remarks,
        Status = NormalizeStatus(row.Status),
        CreatedAt = row.CreatedAt.ToString("O", CultureInfo.InvariantCulture),
        SatisfactionRating = row.SatisfactionRating,
    };

    private static (bool Success, List<ReservedDateSlotDto> Slots, string Message) NormalizeSlots(
        IEnumerable<ReservedDateSlotDto>? input)
    {
        if (input is null)
            return (false, [], "At least one reservation date is required.");

        var slots = new List<ReservedDateSlotDto>();
        foreach (var raw in input)
        {
            if (!TryParseDate(raw.Date, out var date))
                return (false, [], "Reservation date must use yyyy-MM-dd format.");

            if (!TryParseTime(raw.StartTime, out var startTime) ||
                !TryParseTime(raw.EndTime, out var endTime))
                return (false, [], "Reservation time must use HH:mm format.");

            if (endTime <= startTime)
                return (false, [], "Reservation end time must be after start time.");

            slots.Add(new ReservedDateSlotDto
            {
                Date = FormatDate(date),
                StartTime = FormatTime(startTime),
                EndTime = FormatTime(endTime),
            });
        }

        if (slots.Count == 0)
            return (false, [], "At least one reservation date is required.");

        slots = slots
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToList();

        for (var i = 0; i < slots.Count; i++)
        {
            for (var j = i + 1; j < slots.Count; j++)
            {
                if (Overlaps(slots[i], slots[j]))
                    return (false, [], "Selected dates contain overlapping time slots.");
            }
        }

        return (true, slots, string.Empty);
    }

    private static List<ReservedDateSlotDto> ReservationSlots(Reservation row)
    {
        if (HasReservationSlotsJson(row))
        {
            try
            {
                var slots = JsonSerializer.Deserialize<List<ReservedDateSlotDto>>(row.ReservedDatesJson, JsonOptions);
                if (slots is { Count: > 0 })
                    return slots;
            }
            catch
            {
                // Fall back to the legacy single-range columns below.
            }
        }

        return
        [
            new ReservedDateSlotDto
            {
                Date = FormatDate(row.StartDate),
                StartTime = FormatTime(row.StartTime),
                EndTime = FormatTime(row.EndTime),
            },
        ];
    }

    private static bool HasReservationSlotsJson(Reservation row) =>
        !string.IsNullOrWhiteSpace(row.ReservedDatesJson) && row.ReservedDatesJson.Trim() != "[]";

    private static void ApplyDateRange(Reservation reservation, IReadOnlyList<ReservedDateSlotDto> slots)
    {
        var first = slots[0];
        var last = slots[^1];

        reservation.StartDate = ParseDate(first.Date);
        reservation.StartTime = ParseTime(first.StartTime);
        reservation.EndDate = ParseDate(last.Date);
        reservation.EndTime = ParseTime(last.EndTime);
    }

    private static bool Overlaps(ReservedDateSlotDto left, ReservedDateSlotDto right)
    {
        if (!string.Equals(left.Date, right.Date, StringComparison.Ordinal))
            return false;

        var leftStart = ParseTime(left.StartTime);
        var leftEnd = ParseTime(left.EndTime);
        var rightStart = ParseTime(right.StartTime);
        var rightEnd = ParseTime(right.EndTime);

        return leftStart < rightEnd && rightStart < leftEnd;
    }

    private static string SerializeSlots(IEnumerable<ReservedDateSlotDto> slots) =>
        JsonSerializer.Serialize(slots, JsonOptions);

    private static string SerializeEquipment(IEnumerable<RequestedEquipmentItemDto> equipment) =>
        JsonSerializer.Serialize(equipment, JsonOptions);

    private static string NormalizeStatus(string? status) =>
        string.IsNullOrWhiteSpace(status) ? "PENDING" : status.Trim().ToUpperInvariant();

    private static DateOnly ParseDate(string value) =>
        DateOnly.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static TimeOnly ParseTime(string value) =>
        TimeOnly.ParseExact(value, "HH:mm", CultureInfo.InvariantCulture);

    private static bool TryParseDate(string? value, out DateOnly date) =>
        DateOnly.TryParseExact(value?.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

    private static bool TryParseTime(string? value, out TimeOnly time) =>
        TimeOnly.TryParseExact(value?.Trim(), "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out time);

    private static string FormatDate(DateOnly date) =>
        date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string FormatTime(TimeOnly time) =>
        time.ToString("HH:mm", CultureInfo.InvariantCulture);

    private IActionResult ApiFailure(string message) =>
        Ok(new { success = false, message });
}
