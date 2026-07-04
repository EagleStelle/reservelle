using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reservelle.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFacilityDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Facilities");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Facilities",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
