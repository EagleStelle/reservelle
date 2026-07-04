namespace Reservelle.Api.Models;

// A bookable place/category (e.g. Boardroom, Gymnasium, Vans). Parent of
// vehicles, equipment, and reservations.
public class Facility
{
    public int Id { get; set; }
    public string? FacilityName { get; set; }

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
