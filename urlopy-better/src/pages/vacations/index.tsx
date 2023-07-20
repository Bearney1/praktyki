import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Button, Input, Modal, Select, Notification } from "@mantine/core";
import { api } from "~/utils/api";
import { useForm } from "@mantine/form";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { VacationStatus, type WorkingType } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { type IncomingMessage, type ServerResponse } from "http";
import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";

// enum VacationType {
//   remote = "remote",
//   office = "office",
// }

export const toPlType = (stat: WorkingType) => {
  switch (stat) {
    case "remote":
      return "Praca zdalna";
    case "vacation":
      return "Nieobecność";
    default:
      return "Nieznany";
  }
};

export default function Page() {
  const sesion = useSession();
  const [err, setErr] = useState<string>("");
  const { data: projects, error: errorProjects } =
    api.vacation.getAllProjects.useQuery();
  const { data, status, refetch } = api.vacation.getAllForUser.useQuery();
  const { data: belongsTo, isLoading } =
    api.vacation.checkIfUserBelongsToAnyProject.useQuery();

  const { mutateAsync: addVacation } =
    api.vacation.createVacation.useMutation();
  const [opened, { open, close }] = useDisclosure(false);

  const {mutateAsync: updateStatus} = api.admin.updateStatus.useMutation();


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
  useEffect(() => {
    if (status == "error") {
      setErr("Wystąpił błąd");
      setTimeout(() => {
        setErr("");
      }, 3000);
    }
    if (errorProjects) {
      setErr("Wystąpił błąd");
      setTimeout(() => {
        setErr("");
      }, 3000);
    }
  }, [status, errorProjects]);
  // const form = useForm({
  //   initialValues: {
  //     date: [new Date(), new Date()],
  //     why: "",
  //     type: "",
  //   },
  //   validate: {
  //     date: (value) => {
  //       if (!value[0] || !value[1]) {
  //         return "Musisz wybrać datę";
  //       }
  //     },
  //     why: (value) => {
  //       if (value.length < 10) {
  //         return "Powód musi mieć conajmniej 10 znaków";
  //       }
  //     },
  //   },
  // });

  
  const [dates, setDates] = useState<DatesRangeValue>([new Date(), new Date()]);
  const [why, setWhy] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [requiredReason, setRequiredReason] = useState(false);
  const handleAdd = (values: { date: Date[]; why: string; type: string }) => {



    values.date[0] &&
      values.date[1] &&
      addVacation({
        startDate: values.date[0],
        endDate: values.date[1],
        reason: values.why,
        workingType: values.type as WorkingType,
      })
        .then(() =>
          refetch()
            .then(() => close())
            .catch((e) => console.log(e))
        )
        .catch((e) => console.log(e));
  };
  useEffect(() => {
    // Jeśli jest po 12:00 użytkownik może wpisać urlop na następny dzień ale wtedy musi się pokazać okienko do wpisania powodu
    const now = new Date();
    if (now.getHours() >= 12) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = dates[0]!;

      if (start.getDate() == tomorrow.getDate()) {
        setRequiredReason(true);
      } else {
        setRequiredReason(false);
      }



    }
  }, [dates])

  const handleAdd2 = () => {
   
    if (requiredReason && !why && why.length < 10) {
      setErr("Wystąpił błąd - musisz podać powód");
      setTimeout(() => {
        setErr("");
      }, 3000);
      return
    }
    handleAdd({ date: dates as Date[], why, type });
    setDates([new Date(), new Date()]);
    setWhy("");
    setType("");
    
  };
  const [minDate, setMinDate] = useState<Date>(new Date());
  useEffect(() => {
    // add one day to minDate
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMinDate(tomorrow);
  }, [])
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
        <div className="container mx-auto py-10">
          <div className="text-4xl">Loading...</div>
          <span className="loading loading-lg"></span>
        </div>
      </div>
    );
  }
  if (!belongsTo) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white">
        <div className="container mx-auto py-10">
          <div className="text-4xl">
            Nie należysz do żadnego projektu. Skontaktuj się z administratorem.
          </div>
          <div
            className="btn-xl btn mt-4 text-white"
            onClick={() => {
              signOut().catch((e) => console.log(e));
            }}
          >
            Wyloguj
          </div>
        </div>
      </div>
    );
  }
  const getItemsForDropdown = (status: VacationStatus,id :string) => {
    let out: unknown[] = [];
    for (const x in VacationStatus) {
      if (typeof x === "string") {
        out = [
        
          (<li key={x}>
            <a onClick={() => {
              console.log(status, id)
              updateStatus({id, status: x as VacationStatus}).then(() => refetch()).catch((e) => console.log(e))
            }}>{x}</a>
          </li>),
            ...out,
        ]
      }
    }
    return out as JSX.Element[];
  }
  const toPlVac = (stat: VacationStatus) => {
    switch (stat) {
      case "approved":
        return "Zaakceptowany";
      case "rejected":
        return "Odrzucony";
      case "pending":
        return "Oczekujący";
      case "new":
        return "Nowy";
                               
      default:
        return "Nieznany";
    }
  }

  
  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 w-screen items-center md:overflow-hidden">
      {err && (
        <Notification
          withCloseButton={false}
          radius="md"
          title="Wystąpił błąd"
          className="fixed bottom-0 right-0 m-4"
          icon={<IconX size="1.1rem" />}
          color="red"
        >
          {err}
        </Notification>
      )}
      {status == "success" && (
        <div className="container mx-auto md:py-10 max-md:mt-4 max-md:px-0">

          <Modal opened={opened} onClose={close} radius="lg">
              <div className="mb-4 text-2xl font-bold text-white">
                Dodaj urlop
              </div>

              <DatePickerInput
                placeholder="Wybierz datę"
                dropdownType="modal"
                type="range"
                mx="auto"
                allowSingleDateInRange 
                value={dates}
                onChange={setDates}
                minDate={minDate}
              ></DatePickerInput>
               {requiredReason &&  <Input
                  className="mt-2"
                  placeholder="Powód"
                  radius="md"
                  value={why}
                  onChange={(e) => setWhy(e.currentTarget.value)}
                ></Input>}

              <Select
                data={[
                  { value: "remote", label: "Zdalna praca" },
                  { value: "vacation", label: "Nieobecność" },
                ]}
                className="mt-2"
                placeholder="Typ pracy"
                transitionProps={{
                  transition: "pop-top-left",
                  duration: 80,
                  timingFunction: "ease",
                }}
                radius="md"
                value={type}
                onChange={(e) => setType(e!)}
              />
              <button
                className="btn mt-4 text-white hover:bg-black"
                // type="submit"
                onClick={handleAdd2}
              >
                Dodaj
              </button>
          </Modal>

          <div className="flex md:justify-between max-md:flex-col max-md:items-center">
            <div className="dropdown">
              <label tabIndex={0}>
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
                {/* <li>
                  <Link href="/profile">
                  Profile
                  </Link>
                </li> */}
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
              <div className="flex max-md:flex-col">
                {sesion.data?.user.role === "admin" && (
                    <Link
                      className="btn mb-4 ml-4 mt-1 bg-[#25262b] text-white"
                      href="/admin/users"
                    >
                      Zarządzanie urzytkownikami
                    </Link>
                )}
                <Link
                      className="btn mb-4 ml-4 mt-1 bg-[#25262b] text-white"
                      href="/admin/check"
                    >
                      Sprawdź team
                    </Link>
                

                <Button
                  className="btn mb-4 ml-4 mt-1 bg-[#25262b] text-white "
                  onClick={open}
                >
                  Dodaj urlop
                </Button>
              </div>
            </div>
          </div>
          <div className="relative shadow-md sm:rounded-lg">
            <table className="text-md max-md:block md:table max-md:overflow-x-scroll max-md:overflow-y-visible w-full border-separate font-semibold">
              <thead className="text-xl text-white">
                <tr>
                  <th scope="col">Start</th>
                  <th scope="col">Koniec</th>
                  <th scope="col">Powód</th>
                  <th scope="col">Typ</th>
                  <th scope="col" className="text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((vacation) => (
                  <tr key={vacation.id}>
                    <td className=" text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.startDate)}
                    </td>
                    <td className="text-white">
                      {Intl.DateTimeFormat("pl-PL").format(vacation.endDate)}
                    </td>
                    <td className="text-white">
                      {vacation.reason}
                    </td>
                    <td
                      className={`${
                        vacation.workingType == "remote"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {toPlType(vacation.workingType)}
                     
                    </td>
                    <td className="text-right">
                      
                      {sesion.data?.user.role === "admin" ? <div className="dropdown-hover dropdown">
                        <label
                          tabIndex={0}
                       className={`${color(vacation.status)} font-bold`}
                        >
                           {toPlVac(vacation.status)}
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu rounded-box z-[1] w-44 bg-base-100 p-2 shadow max-md:hidden"
                        >
                          {
                            getItemsForDropdown(
                              vacation.status , vacation.id)
                          }
                          {/* <li>
                            <a>Item 1</a>
                          </li>
                          <li>
                            <a>Item 2</a>
                          </li> */}
                        </ul>
                      </div>: <div className={`${color(vacation.status)} font-bold`}>{toPlVac(vacation.status)}</div>}
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

export async function getServerSideProps(ctx: {
  req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> };
  res: ServerResponse<IncomingMessage>;
}) {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role === "user" || session?.user.role === "admin") {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
