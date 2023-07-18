import { Select } from "@mantine/core";
import React, { useState } from "react";
import { api } from "~/utils/api";

export default function Page() {
  const { data: projects } = api.vacation.getAllProjectsF.useQuery({
    q: "",
  });
  const [projectId, setProjectId] = useState<string>("");
  const { data: users } = api.vacation.getUsersForProjectForToday.useQuery({
    id: projectId,
  });
  // const { data: projectInfo } = api.admin.getAllInfoProject.useQuery({
  //   id: projectId,
  // });
  const { data: count } = api.vacation.getAllCountAndOnVacationCount.useQuery({
    id: projectId,
  });

  const projectIdChange = (e: string) => {
    setProjectId(e);
  };
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-900 p-24 text-center font-semibold text-white">
      <div className="flex w-full items-center">
        {/* <TextInput size='md' w="100%" radius="md"/> */}
        <Select
          data={
            projects?.map((e) => {
              return { value: e.id, label: e.name };
            }) ?? []
          }
          value={projectId}
          onChange={projectIdChange}
          size="md"
          w="100%"
          searchable
          radius="md"
        />
        {/* <button className="btn ml-8 h-full px-8 text-white bg-[#25262b]">Wyszukaj</button> */}
      </div>
      <div className="mt-8 flex min-h-[150px] w-full rounded-2xl p-8 justify-center flex-col items-center">
        {/* <div className="text-4xl mb-4">{projectInfo?.name}</div> */}
        <div className="flex">
        <div className="flex flex-col mx-4">
          <span className="countdown font-mono text-6xl">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <span style={{ "--value": count?.online }}></span>
          </span>
          Online
        </div>
        <div className="text-7xl mx-1">
            /
        </div>
        <div className="flex flex-col mx-4">
          <span className="countdown font-mono text-6xl">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <span style={{ "--value": count?.onVacation }}></span>
          </span>
          Offline
        </div>
        </div>
      </div>
      <div className="divider my-4"></div>
      <div className="min-h-[100px] w-full">
        <table className="table">
          <thead>
            <tr className="text-lg text-white">
              <th>Imię, Nazwisko</th>
              <th>Data od</th>
              <th>Data do</th>
              <th>Typ</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((x) => (
              <tr key={x.id} className={x.startDate ? "bg-red-950" : ""}>
                <td>{x.name}</td>
                <td>
                  {x.startDate ? (
                    Intl.DateTimeFormat("pl-PL").format(x.startDate)
                  ) : (
                    <div> ---- </div>
                  )}
                </td>
                <td>
                  {x.endDate ? (
                    Intl.DateTimeFormat("pl-PL").format(x.endDate)
                  ) : (
                    <div> ---- </div>
                  )}
                </td>
                <td>{x.Type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
