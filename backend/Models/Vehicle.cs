namespace Reservelle.Api.Models;

// One row in the vehicles table. Properties map to columns.
public class Vehicle
{
    public int Id { get; set; }              // primary key, auto-incremented
    public string Brand { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "active";

    public int FacilityId { get; set; }      // FK to Facility
    public Facility Facility { get; set; } = null!;
}
