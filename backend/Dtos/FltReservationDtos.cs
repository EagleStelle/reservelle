namespace Reservelle.Api.Dtos;

public class ReservedDateSlotDto
{
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

public class RequestedEquipmentItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class FltEquipmentItemDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string Status { get; set; } = string.Empty;
    public int FacilityId { get; set; }
    public string? FacilityName { get; set; }
}

public class FltReservationPayloadDto
{
    public string RoomType { get; set; } = string.Empty;
    public int ExpectedAttendees { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string? AdditionalInstructions { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public List<ReservedDateSlotDto> ReservedDates { get; set; } = [];
    public List<RequestedEquipmentItemDto> RequestedEquipment { get; set; } = [];
}

public class FltApprovedEventDto
{
    public string EventTitle { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string EventKind { get; set; } = "RESERVATION";
}

public class FltReservationRecordDto
{
    public int Id { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string ReservedDates { get; set; } = "[]";
    public string? RequestedEquipment { get; set; }
    public string? RoomType { get; set; }
    public string? ExpectedAttendees { get; set; }
    public string? CoordinationDate { get; set; }
    public string? CoordinationStartTime { get; set; }
    public string? CoordinationEndTime { get; set; }
    public string? AdditionalInstructions { get; set; }
    public string Status { get; set; } = "PENDING";
    public string CreatedAt { get; set; } = string.Empty;
    public int? SatisfactionRating { get; set; }
}

public class SetFltCoordinationDto
{
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

public class RescheduleFltReservationDto
{
    public List<ReservedDateSlotDto> ReservedDates { get; set; } = [];
}
