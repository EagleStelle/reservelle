using System.Text.Json.Serialization;

namespace Reservelle.Api.Dtos;

// The exact JSON shape the frontend expects for a vehicle row.
public class VehicleDto
{
    public int Id { get; set; }
    public string Brand { get; set; } = string.Empty;

    [JsonPropertyName("plate_num")]           // frontend uses snake_case here
    public string PlateNum { get; set; } = string.Empty;

    public int Capacity { get; set; }
    public string VehicleDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int FacilityId { get; set; }
    public string? FacilityName { get; set; }
}
