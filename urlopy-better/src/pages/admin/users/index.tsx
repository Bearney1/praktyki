import { type IncomingMessage, type ServerResponse } from "http";
import React, { useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import Line from "./Line";
import { Input } from "@mantine/core";
import { useForm } from "@mantine/form";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
export default function Index() {
  const session = useSession();
  const { data, status, error, refetch } = api.admin.getAllUsers.useQuery();
  const [q, setq] = useState("");
  const { data: projects, refetch:refetchProjects } = api.admin.getAllProjects.useQuery({ q });
  const { mutateAsync: changeRole } = api.admin.changeUserRole.useMutation();
  const {mutateAsync: createProject} = api.admin.createProject.useMutation()
  const handleChangeRole = async (id: string, checked: boolean) => {
    await changeRole({ id, role: checked ? "admin" : "user" });
    await refetch();
  };
  const r = async () => {
    await refetch();
  };
  const ref = React.useRef<HTMLDialogElement>(null);
  const form = useForm({
    initialValues: {
      name: "",
    },
  })
  
  const handleSubmit = (values: {
    name: string;
}) => {
  ref.current?.close()
   const x =async () => {
    await createProject({
      name: values.name
    })
    await refetchProjects()
   }
   void x()

  }
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-900 p-24 text-center font-semibold text-white">
      <div className="flex w-full justify-between px-4">
      <div className="dropdown">
              <label tabIndex={0}  >
                <div className="avatar">
                    <div className="h-12 w-12">
                    {session.data?.user.image && (
 <Image
                        src={session.data?.user.image}
                        alt="avatar"
                       fill
                       className="rounded-full"
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
                  <Link href="/admin">Select project</Link>
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
        <button className="btn" onClick={() => ref.current?.showModal()}>Utwórz projekt</button>
      </div>
      <dialog ref={ref} className="modal">
        <form method="dialog" className="modal-box" onSubmit={form.onSubmit(handleSubmit)}>
          <h3 className="text-lg font-bold mb-4">Dodawanie projektu</h3>
       
            <Input
            placeholder="Nazwa projektu"
            required
            {...form.getInputProps('name')}
            />
         
          <div className="modal-action">
            <button className="btn">Dodaj</button>
          </div>
        </form>
      </dialog>
      {status === "loading" && (
        <span className="loading loading-spinner loading-lg"></span>
      )}
      {status === "error" && <span>Error: {error.message}</span>}
      <table className="table">
        <thead>
          <tr>
            <th>Imię</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Projekty</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((user) => (
            <tr key={user.id}>
              <Line
                user={user}
                handleChangeRole={handleChangeRole}
                projects={projects}
                refetch={r}
                userprojects={user.Project}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export async function getServerSideProps(ctx: {
  req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> };
  res: ServerResponse<IncomingMessage>;
}) {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role === "admin") {
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
