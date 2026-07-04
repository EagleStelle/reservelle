using System.Text.Json.Serialization;

namespace Reservelle.Api.Dtos;

// Body of PUT /admin/updatevehicle.
public class UpdateVehicleDto
{
    public int Id { get; set; }
    public int FacilityId { get; set; }
    public string Brand { get; set; } = string.Empty;

    [JsonPropertyName("plate_num")]
    public string PlateNum { get; set; } = string.Empty;

    public int Capacity { get; set; }
    public string VehicleDescription { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
}
