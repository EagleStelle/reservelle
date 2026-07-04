namespace Reservelle.Api.Models;

// Bookable equipment inventory, owned by a facility.
public class Equipment
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string Status { get; set; } = "active";

    public int FacilityId { get; set; }      // FK to Facility
    public Facility Facility { get; set; } = null!;

    // Equipment requested across reservations (many-to-many).
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
