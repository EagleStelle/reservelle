using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reservelle.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFltReservationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_FacilityId",
                table: "Reservations");

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "CoordinationDate",
                table: "Reservations",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "CoordinationEndTime",
                table: "Reservations",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "CoordinationStartTime",
                table: "Reservations",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Organization",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RequestedEquipmentJson",
                table: "Reservations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReservedDatesJson",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "RoomType",
                table: "Reservations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SatisfactionRating",
                table: "Reservations",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_FacilityId_Status",
                table: "Reservations",
                columns: new[] { "FacilityId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_FacilityId_Status",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CoordinationDate",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CoordinationEndTime",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CoordinationStartTime",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Organization",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "RequestedEquipmentJson",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ReservedDatesJson",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "RoomType",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "SatisfactionRating",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_FacilityId",
                table: "Reservations",
                column: "FacilityId");
        }
    }
}
