// import React from "react";

import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Input, Modal, Select } from "@mantine/core";
import { api } from "~/utils/api";
import { useState } from "react";
import { useForm } from "@mantine/form";

export default function Page() {
  const { data, status } = api.vacation.getAllForUser.useQuery();
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


  return (
    <div className="dark flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
      {status == "success" && (
        <div className="container mx-auto py-10">
          {/* <dialog ref={ref} className="modal"> */}
          
          <Modal opened={opened} onClose={close} radius="lg">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <div className="text-2xl mb-4 font-bold">Dodaj urlop</div>
            <DatePickerInput
              placeholder="Wybierz datę"
              dropdownType="modal"
              type="range"
              mx="auto"
              {...form.getInputProps('date')}
            ></DatePickerInput>
            <Input className="mt-2" placeholder="Powód" radius="md" {...form.getInputProps('why')}></Input>
            <Select
              data={[
                { value: "remote", label: "Zdalna praca" },
                { value: "office", label: "Praca w biurze" },
              ]}
              className="mt-2"
              placeholder="Typ pracy"
              radius="md"
              {...form.getInputProps('type')}
            />
            <button className="btn mt-4 text-white hover:bg-black" type="submit">
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
            <table className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-700 dark:bg-neutral-700 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Start
                  </th>
                  <th scope="col" className="px-6 py-3">
                    End
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((vacation) => (
                  <tr
                    key={vacation.id}
                    className="border-b bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <th scope="row" className="px-6 py-4 text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </th>
                    <td className="px-6 py-4 text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`${color(
                          vacation.status
                        )} w-min px-2 py-2 font-bold`}
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
