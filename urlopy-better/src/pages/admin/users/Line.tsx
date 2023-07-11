import { MultiSelect } from '@mantine/core'
import { type Project, type User } from '@prisma/client'
import React, { useEffect } from 'react'
import { api } from '~/utils/api'

export default function Line(props: {user: User | undefined, projects: Project[] | undefined, userprojects: Project[], handleChangeRole: (id: string, checked: boolean) => Promise<void>, refetch: () => Promise<void>}) {
  // const [q, setq] = React.useState('')
  const [values, setValues] = React.useState<string[]>(() => props.userprojects?.map(e => e.id) ?? [])
  const {mutateAsync: updateProjectsForUser} = api.admin.updateProjectsForUser.useMutation()
  const handleChange = async () => {
    if (props.user && props.projects) {
      await updateProjectsForUser({
          id: props.user.id,
          projects: values
      })
      await props.refetch()
    }
  }
  useEffect(() => {
      void handleChange()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

const handleChangeRoleMy = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (props.user)
  void props.handleChangeRole(props.user.id,e.target.checked).catch(e => console.log(e))
}

    return (
    <>
    {props.user && props.projects && props.userprojects && props.user.id &&
   <>
     <td>{props.user.name}</td>
              <td>{props.user.email}</td>
              <td><input type="checkbox" className="checkbox-primar checkbox-md" checked={props.user.role === "admin"} onChange={handleChangeRoleMy} /></td>
              <td className="max-w-[200px]">
                {props.projects && <MultiSelect
                  data={props.projects.map((e) => {
                    return {value: e.id, label: e.name}
                  })}
                  onChange={setValues}
                  placeholder="Pick all that you like"
                  searchable
                  hoverOnSearchChange
                  value={values}
                  nothingFound="Nothing found"
                />}
              </td></>
    }
    </>
  )
}
