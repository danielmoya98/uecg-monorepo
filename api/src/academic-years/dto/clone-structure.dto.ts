import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsBoolean, IsOptional } from "class-validator";

export class CloneStructureDto {
  @ApiProperty({
    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    description:
      "ID de la gestión escolar origen desde donde se copiará la estructura de cursos",
  })
  @IsUUID("4", { message: "sourceYearId debe ser un UUID válido" })
  sourceYearId: string;

  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description:
      "Indica si también se deben clonar las vinculaciones de materias y profesores asignados",
  })
  @IsOptional()
  @IsBoolean()
  cloneAssignments?: boolean;

  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description:
      "Indica si se deben mantener las aulas físicas fijas asociadas a cada curso",
  })
  @IsOptional()
  @IsBoolean()
  cloneBaseRooms?: boolean;
}
