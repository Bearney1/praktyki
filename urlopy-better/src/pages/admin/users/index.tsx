import { MultiSelect } from "@mantine/core";
import { type IncomingMessage, type ServerResponse } from "http";
import React, { useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export default function Index() {
  const { data, status, error, refetch } = api.admin.getAllUsers.useQuery();
  const [q, setq] = useState("");
  const {data: projects} = api.admin.getAllProjects.useQuery({q})
  const {mutateAsync: changeRole} = api.admin.changeUserRole.useMutation()
  
  const handleChangeRole = async (id: string, checked: boolean) => {
    await changeRole({id, role: checked ? "admin" : "user"})
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
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><input type="checkbox" className="checkbox-primar checkbox-md" checked={user.role === "admin"} onChange={(e) => { handleChangeRole(user.id,e.target.checked).catch(e => console.log(e))}} /></td>
              <td className="max-w-[200px]">
                <MultiSelect
                  data={projects?.map((e) => e.name) ?? []}
                  placeholder="Pick all that you like"
                  searchable
                  searchValue={q}
                  onSearchChange={setq}

                  value={user.Project.map((e) => e.name)}
                  nothingFound="Nothing found"
                />
              </td>
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
