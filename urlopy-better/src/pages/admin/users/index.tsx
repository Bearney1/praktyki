import { type IncomingMessage, type ServerResponse } from "http";
import React, { useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import Line from "./Line";

export default function Index() {
  const { data, status, error, refetch } = api.admin.getAllUsers.useQuery();
  const [q, setq] = useState("");
  const {data: projects} = api.admin.getAllProjects.useQuery({q})
  const {mutateAsync: changeRole} = api.admin.changeUserRole.useMutation()
  
  const handleChangeRole = async (id: string, checked: boolean) => {
    await changeRole({id, role: checked ? "admin" : "user"})
    await refetch()
} 
const r = async () => {
    await refetch()
}
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-900 p-24 text-center font-semibold text-white">
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
             <Line user={user} handleChangeRole={handleChangeRole} projects={projects} refetch={r} userprojects={user.Project} />
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
