// import React from "react";

import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Input, Modal, Select } from "@mantine/core";
import { api } from "~/utils/api";
import { useForm } from "@mantine/form";

enum VacationType {
  remote = "remote",
  office = "office",
}

export default function Page() {
  const { data, status, refetch } = api.vacation.getAllForUser.useQuery();
  const { mutate: addVacation } = api.vacation.createVacation.useMutation();
  const [opened, { open, close }] = useDisclosure(false);

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

  const form = useForm({
    initialValues: {
      date: [new Date(), new Date()],
      why: "",
      type: "",
    },
  });

  const handleAdd = (values: { date: Date[]; why: string; type: string }) => {
    values.date[0] && values.date[1] &&
      addVacation({
        startDate: values.date[0],
        endDate: values.date[1],
        reason: values.why,
        workingType: values.type as VacationType,
      });
      refetch().then(() => close()).catch(e => console.log(e));
      

  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
      {status == "success" && (
        <div className="container mx-auto py-10">
          {/* <dialog ref={ref} className="modal"> */}

          <Modal opened={opened} onClose={close} radius="lg">
            <form onSubmit={form.onSubmit(handleAdd)}>
              <div className="mb-4 text-2xl font-bold">Dodaj urlop</div>
              <DatePickerInput
                placeholder="Wybierz datę"
                dropdownType="modal"
                type="range"
                mx="auto"
                {...form.getInputProps("date")}
              ></DatePickerInput>
              <Input
                className="mt-2"
                placeholder="Powód"
                radius="md"
                {...form.getInputProps("why")}
              ></Input>
              <Select
                data={[
                  { value: "remote", label: "Zdalna praca" },
                  { value: "office", label: "Praca w biurze" },
                ]}
                className="mt-2"
                placeholder="Typ pracy"
                radius="md"
                {...form.getInputProps("type")}
              />
              <button
                className="btn mt-4 text-white hover:bg-black"
                type="submit"
              >
                Dodaj
              </button>
            </form>
          </Modal>

          <div className="flex justify-end">
            <button className="btn mb-4 text-white" onClick={open}>
              Add vacation
            </button>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="text-md table">
              <thead className="text-xl text-white">
                <tr>
                  <th scope="col">Start</th>
                  <th scope="col">End</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((vacation) => (
                  <tr key={vacation.id}>
                    <th scope="row" className=" text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </th>
                    <td className="text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </td>
                    <td className="text-white max-w-[150px]">
                      {vacation.reason}
                    </td>
                    <td className={`text-white ${vacation.workingType == "office" ? "text-green-400" : "text-blue-400"}`}>
                      {vacation.workingType}
                    </td>
                    <td>
                      <div
                        className={`${color(vacation.status)} w-min font-bold`}
                      >
                        {vacation.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {status == "loading" && <div className="text-4xl">Loading...</div>}
      {status == "error" && <div className="text-4xl">Error</div>}
    </div>
  );
}
