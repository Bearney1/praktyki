import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { color } from "../[slug]";
import { VacationStatus, WorkingType } from "@prisma/client";
import { toPlType } from "~/pages/vacations";

enum SortBy {
  Type = "Type",
  StartDate = "StartDate",
  EndDate = "EndDate",
  Name = "Name",
  None = "None",
}

enum SortType {
  Asc = "asc",
  Desc = "desc",
}

const toPlSortBy = (e: SortBy) => {
  switch (e) {
    case SortBy.Name:
      return "Imię, Nazwisko";
    case SortBy.StartDate:
      return "Data od";
    case SortBy.EndDate:
      return "Data do";
    case SortBy.Type:
      return "Typ";
    default:
      return "";
}
}


export default function Page() {
  const [projectId, setProjectId] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.None);
  const [sortType, setSortType] = useState<SortType>(SortType.Asc);
  const { data: projects } = api.vacation.getAllProjectsF.useQuery({
    q: "",
  });
  useEffect(()=> {
    if (projects && projects[0] != undefined) {
      setProjectId(projects[0].id)
    }
  },[])
  const [dayToCheck, setDayToCheck] = useState<Date>(new Date());
  const { data: users } = api.vacation.getUsersForProjectForToday.useQuery({
    id: projectId,
    day: dayToCheck,
    sortBy,
    sortType,
  });
  // const { data: projectInfo } = api.admin.getAllInfoProject.useQuery({
  //   id: projectId,
  // });
  const { data: count } = api.vacation.getAllCountAndOnVacationCount.useQuery({
    id: projectId,
    day: dayToCheck,
  });

  const projectIdChange = (e: string) => {
    setProjectId(e);
  };
  const setSort = (e: SortBy) => {
    if (sortBy === e) {
      if (sortType === SortType.Asc) {
        setSortType(SortType.Desc);
      } else {
        setSortType(SortType.Asc);
      }
    } else {
      setSortBy(e);
      setSortType(SortType.Asc);
    }
    console.log(sortBy, sortType);
  }
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
        <DatePickerInput
          value={dayToCheck}
          onChange={e => setDayToCheck(e!)}
          size="md"
          w="100%"
          radius="md"
          className="ml-4 max-w-md"
        />
        <Link className="btn ml-4 h-full px-8 text-white bg-[#25262b]" href="/vacations">Powrót</Link>
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
        {sortBy != SortBy.None && <div>
          <div>Sortowanie: <span className="font-extrabold">{toPlSortBy(sortBy)}</span></div>
          <div>Kierunek: <span className="font-extrabold">{sortType === SortType.Asc? "Rosnąco" : "Malejąco"}</span></div>
        
          </div>}
        <table className="table">
          <thead>
            <tr className="text-lg text-white">
              <th onClick={() => setSort(SortBy.Name)}>Imię, Nazwisko</th>
              <th onClick={() => setSort(SortBy.StartDate)}>Data od</th>
              <th onClick={() => setSort(SortBy.EndDate)}>Data do</th>
              <th onClick={() => setSort(SortBy.Type)}>Typ</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((x) => (
              <tr key={x.id + (x.startDate?.getDate() ?? 0).toString()} className={x.startDate ? "bg-red-950" : ""}>
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
                <td>{toPlType(x.Type as WorkingType)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
