namespace Reservelle.Api.Dtos;

// Body of PUT /admin/updateequipment.
public class UpdateEquipmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int FacilityId { get; set; }
    public string Status { get; set; } = "ACTIVE";
}
