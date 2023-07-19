import { useRouter } from "next/router";
import React from "react";

import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Input, Modal, Select } from "@mantine/core";
import { api } from "~/utils/api";
import { useForm } from "@mantine/form";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { VacationStatus } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { type IncomingMessage, type ServerResponse } from "http";

enum VacationType {
  remote = "remote",
  office = "vacation",
}

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

export const color = (stat: string) => {
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

export default function Page() {
  const router = useRouter();
  const sesion = useSession();
  const { data, status, refetch } = api.admin.getAllInfoProject.useQuery({
    id: router.query.slug as string,
  });

  const { data: userAvailable } = api.admin.getUsersForPojectAndCheckIfTheyAreInVacation.useQuery({id: router.query.slug as string})
 

  const {data :usersFromDb} = api.admin.getUsersForProject.useQuery({
    id: router.query.slug as string,
  });
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (usersFromDb) {
      let a: User[] = [];

      usersFromDb.forEach((user) => {
        const p: User = {
          id: user.id,
          name: user.user.name,
          image: user.user.image,
        };
        a = [...a, p];
      });
      setUsers([...a]);
    }
  }, [users, usersFromDb]);

  const { mutateAsync: addVacation } =
    api.admin.createVacation.useMutation();

    const {mutateAsync: updateStatus} = api.admin.updateStatus.useMutation();
  const [opened, { open, close }] = useDisclosure(false);
 

  const form = useForm({
    initialValues: {
      date: [new Date(), new Date()],
      why: "",
      type: "",
      userId: ""
    },
    validate: {
      date: (value) => {
        if (!value[0] || !value[1]) {
          return "Daty muszą być wybrane!";
        }
        return null;
      },
      why: (value) => {
        if (!value) {
          return "Powód jest wymagany!";
        }
        return null;
      }, 
      type: (value) => {
        if (!value) {
          return "Typ urlopu jest wymagany!";
        }
        return null;
      },
      userId: (value) => {
        if (!value) {
          return "Urzytkownik jest wymagany!";
        }
        return null;
      }
    }
  });

  const handleAdd = (values: { date: Date[]; why: string; type: string, userId: string }) => {
    console.log(values.date);
    values.date[0] &&
      values.date[1] &&
      addVacation({
        startDate: values.date[0],
        endDate: values.date[1],
        reason: values.why,
        workingType: values.type as VacationType,
        projectId: router.query.slug as string,
        userId: values.userId
      })
        .then(() =>
          refetch()
            .then(() => close())
            .catch((e) => console.log(e))
        )
        .catch((e) => console.log(e));
  };

  const getItemsForDropdown = (status: VacationStatus,id :string) => {
    let out: unknown[] = [];
    for (const x in VacationStatus) {
      if (typeof x === "string") {
        out = [
        
          (<li key={x}>
            <a onClick={() => {
              updateStatus({id, status: x as VacationStatus}).then(() => refetch()).catch((e) => console.log(e))
            }}>{x}</a>
          </li>),
            ...out,
        ]
      }
    }
    return out as JSX.Element[];
  }
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-900 p-24 text-center  font-semibold text-white">
      <h1 className="text-4xl">Admin {router.query.slug}</h1>
      <div className="justify-center mt-8 grid grid-flow-col auto-cols-max avatar-group w-full ">
        {userAvailable?.map((user) => (<div className="mx-4" key={user.id}>
            {user.avatar && (
              <Image
                src={user.avatar}
                alt="avatar"
                className={`avatar ring ${user.status==="working"? "ring-green-600": "ring-gray-600"} m-2`}
                title={`${user.name} is ${user.status}`}
                width="75"
                height="75"
              />
            )}
        </div>))}
      </div>
      {status == "success" && (
        <div className="container mx-auto pb-10 pt-5">
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
              <Select
                className="mt-2"
                placeholder="Użytkownik"
                radius="md"
                searchable
                data={users.map((user) => {
                  return {value: user.id, label: user.name ? user.name : "Brak imienia - " + user.id}
                })}
                {...form.getInputProps("userId")}
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
              <label tabIndex={0} className="ml-4">
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
                  <Link href="/admin" prefetch={false} passHref>Select project</Link>
                </li>
                <li>
                  <div
                    onClick={() => {
                      signOut().catch((e) => console.log(e));
                    }}
                  >
                    Logout
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <button className="btn mb-4 text-white mr-4" onClick={open}>
                Add vacation
              </button>
            </div>
          </div>
          <div className="relative  shadow-md sm:rounded-lg">
            <table className="text-md table">
              <thead className="text-xl text-white">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Start</th>
                  <th scope="col">End</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Type</th>
                  <th scope="col" className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.vacation.map((vacation) => (
                  <tr key={vacation.id}>
                    <th scope="row" className="text-white">
                      {vacation.user.name}
                    </th>
                    <th scope="row" className=" text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </th>
                    <td className="text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.endDate)}
                    </td>
                    <td className="max-w-[150px] text-white">
                      {vacation.reason}
                    </td>
                    <td
                      className={`text-white ${
                        vacation.workingType == "vacation"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {vacation.workingType}
                    </td>
                    <td className="text-right">
                      <div className="dropdown-hover dropdown">
                        <label
                          tabIndex={0}
                          className={`${color(
                            vacation.status
                          )} w-min font-bold`}
                        >
                          {vacation.status.toUpperCase()}
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu rounded-box z-[1] w-44 bg-base-100 p-2 shadow"
                        >
                          {
                            getItemsForDropdown(
                              vacation.status, vacation.id)
                          }
                          {/* <li>
                            <a>Item 1</a>
                          </li>
                          <li>
                            <a>Item 2</a>
                          </li> */}
                        </ul>
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
  if (session?.user.role === "admin") {
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