namespace Reservelle.Api.Dtos;

// Matches the frontend's EquipmentRow.
public class EquipmentDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string Status { get; set; } = string.Empty;
    public int FacilityId { get; set; }
    public string? FacilityName { get; set; }
}
