// import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "~/utils/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DialogForm from "./DialogForm";

// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table"

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// import { columns } from "./vacations";
// import { api } from "~/utils/api";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[]
//   data: TData[]
// }

// function DataTable<TData, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {
//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   })

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow key={headerGroup.id}>
//               {headerGroup.headers.map((header) => {
//                 return (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 )
//               })}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {table.getRowModel().rows?.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 data-state={row.getIsSelected() && "selected"}
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell key={cell.id}>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={columns.length} className="h-24 text-center">
//                 No results.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// export default function Page() {
//   const { data, status } = api.vacation.getAllForUser.useQuery();
//   return (
//     <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
//       {status == "success" && <div className="container mx-auto py-10">
//       <DataTable columns={columns} data={data}  />
//     </div>}
//       {status == "loading" && <div className="text-4xl">Loading...</div>}
//       {status == "error" && <div className="text-4xl">Error</div>}
//     </div>
//   );
// }

export default function Page() {
  const { data, status } = api.vacation.getAllForUser.useQuery();
  const color = (stat: string) => {
    switch (stat) {
      case "accepted":
        return "text-green-300";
      case "rejected":
        return "text-red-300";
      case "pending":
        return "text-yellow-300";
      default:
        return "text-gray-300";
    }
  };
  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
      {status == "success" && (
        <div className="container mx-auto py-10">
          <div>
            <Dialog>
              <DialogTrigger><Button variant="destructive">Add vacation</Button></DialogTrigger>
             <DialogForm />
            </Dialog>
          </div>
          <Table>
            <TableCaption>A list of vacations</TableCaption>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="min-w-[100px]">Id</TableHead> */}
                <TableHead className="w-[100px]">Start</TableHead>
                <TableHead className="w-[100px]">End</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((vacation) => (
                <TableRow key={vacation.id}>
                  <TableCell className="">
                    {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                  </TableCell>
                  <TableCell className="">
                    {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                  </TableCell>
                  <TableCell className=" flex justify-end">
                    <div
                      className={`${color(
                        vacation.status
                      )} w-min px-2 py-2 font-bold`}
                    >
                      {vacation.status.toUpperCase()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {status == "loading" && <div className="text-4xl">Loading...</div>}
      {status == "error" && <div className="text-4xl">Error</div>}
    </div>
  );
}
