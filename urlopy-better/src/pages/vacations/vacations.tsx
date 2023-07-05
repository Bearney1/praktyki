import { type Vacation } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
export type MyVacation = {
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
}
export const columns: ColumnDef<MyVacation>[] = [
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
    },
    {
        accessorKey: "status",
        header: "Status",
      },
  ]
  