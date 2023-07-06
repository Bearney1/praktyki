import { type Vacation } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
export type MyVacation = {
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
}
