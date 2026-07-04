using System.Text.Json.Serialization;

namespace Reservelle.Api.Dtos;

// Body of POST /admin/createequipment. Legacy quirk: the JSON "id" is the facilityId.
public class CreateEquipmentDto
{
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public int FacilityId { get; set; }

    public string Status { get; set; } = "ACTIVE";
}
