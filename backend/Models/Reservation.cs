namespace Reservelle.Api.Models;

// A booking request for a facility.
public class Reservation
{
    public int Id { get; set; }
    public string EventName { get; set; } = string.Empty;
    public int Headcount { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public DateOnly EndDate { get; set; }
    public TimeOnly EndTime { get; set; }

    public string? Remarks { get; set; }
    public string Status { get; set; } = "pending";   // pending / approved / rejected
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int FacilityId { get; set; }               // FK to Facility (the room)
    public Facility Facility { get; set; } = null!;

    public int? UserId { get; set; }                  // optional: who booked it
    public User? User { get; set; }

    // Equipment requested for this reservation (many-to-many).
    public ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
}
