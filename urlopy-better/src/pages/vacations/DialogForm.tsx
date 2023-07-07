// import {
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import React, { useState } from "react";
// import { addDays, format } from "date-fns";
// import { DateRange } from "react-day-picker";
// import { CalendarIcon } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// export default function DialogForm() {
//   const [date, setDate] = useState<DateRange>({
//     from: new Date(2022, 0, 20),
//     to: new Date(2022, 0, 20),
//   });
//   return (
//     <DialogContent className="text-white w-56">
//       <DialogHeader>
//         <DialogTitle>Select vacation scope.</DialogTitle>
//         <DialogDescription>
//           Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam
//           nobis voluptatem eius.
//         </DialogDescription>
//         <Popover>
//           <PopoverTrigger>Enter date</PopoverTrigger>
//           <PopoverContent>
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {date.from ? (
//               date.to ? (
//                 <>
//                   {format(date.from, "LLL dd, y")} -{" "}
//                   {format(date.to, "LLL dd, y")}
//                 </>
//               ) : (
//                 format(date.from, "LLL dd, y")
//               )
//             ): "Please select dates"}

//             <Calendar
//               initialFocus
//               mode="range"
//               defaultMonth={date?.from}
//               selected={date}
//               onSelect={setDate}
//               numberOfMonths={2}
//             />
//           </PopoverContent>
//         </Popover>
//       </DialogHeader>
//     </DialogContent>
//   );
// }


import React from 'react'

export default function DialogForm() {
  return (
    <div></div>
  )
}
