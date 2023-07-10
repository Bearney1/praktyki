// import React from "react";

import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Input, Modal, Select } from "@mantine/core";
import { api } from "~/utils/api";
import { useForm } from "@mantine/form";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { IncomingMessage, ServerResponse } from "http";
import { VacationStatus } from "@prisma/client";
import { useState } from "react";

enum VacationType {
  remote = "remote",
  office = "office",
}

export default function Page() {
  const sesion = useSession();
  const { data, status, refetch } = api.vacation.getAllForUser.useQuery();
  const {data: belongsTo} = api.vacation.checkIfUserBelongsToAnyProject.useQuery()

  const { mutateAsync: addVacation } =
    api.vacation.createVacation.useMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const color = (stat: VacationStatus) => {
    switch (stat) {
      case VacationStatus.approved:
        return "text-green-300";
      case VacationStatus.rejected:
        return "text-red-300";
      case VacationStatus.pending:
        return "text-yellow-300";
      case VacationStatus.new:
        return "text-blue-300";
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
    console.log(values.date);
    values.date[0] &&
      values.date[1] &&
      addVacation({
        startDate: values.date[0],
        endDate: values.date[1],
        reason: values.why,
        workingType: values.type as VacationType,
      })
        .then(() =>
          refetch()
            .then(() => close())
            .catch((e) => console.log(e))
        )
        .catch((e) => console.log(e));
  };
  if (!belongsTo) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
        <div className="container mx-auto py-10">
          <div className="text-4xl">Nie należysz do żadnego projektu. Skontaktuj się z administratorem.</div>
          <div className="btn btn-xl mt-4 text-white" onClick={() => {signOut().catch(e => console.log(e))}}>
            Wyloguj
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
      {status == "success" && (
        <div className="container mx-auto py-10">
          {/* <dialog ref={ref} className="modal"> */}

          <Modal opened={opened} onClose={close} radius="lg">
            <form onSubmit={form.onSubmit(handleAdd)}>
              <div className="mb-4 text-2xl font-bold text-white">
                Dodaj urlop
              </div>
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

          <div className="flex justify-between">
            <div className="dropdown">
              <label tabIndex={0} >
                <div className="avatar">
                  <div className="rounded-full">
                    {sesion.data?.user.image && (
                      <Image
                        src={sesion.data?.user.image}
                        alt="avatar"
                        width="35"
                        height="35"
                      />
                    )}
                  </div>
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu rounded-box z-[1] w-52 bg-neutral-800 p-2 shadow"
              >
                <li>
                  <Link href="/profile">
                  Profile
                  </Link>
                </li>
                <li>
                  <div onClick={() => {signOut().catch(e => console.log(e))}}>
                    Logout 
                  </div>
                </li>
              </ul>
            </div>
            <div>
          

              <button className="btn mb-4 text-white" onClick={open}>
                Add vacation
              </button>
            </div>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="text-md table">
              <thead className="text-xl text-white">
                <tr>
                  <th scope="col">Start</th>
                  <th scope="col">End</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Type</th>
                  <th scope="col" className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((vacation) => (
                  <tr key={vacation.id}>
                    <th scope="row" className=" text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </th>
                    <td className="text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.endDate)}
                    </td>
                    <td className="max-w-[150px] overflow-x-auto text-white">
                      {vacation.reason}
                    </td>
                    <td
                      className={`text-white ${
                        vacation.workingType == "office"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {vacation.workingType}
                    </td>
                    <td className="text-right">
                      <div
                        className={`${color(vacation.status)} font-bold`}
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


export async function getServerSideProps(ctx: { req: IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; }; res: ServerResponse<IncomingMessage>; }) {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role === "user") {
    return {
      props: {}
    }
  }
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}