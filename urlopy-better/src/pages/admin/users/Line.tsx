import { MultiSelect } from '@mantine/core'
import { Project, User } from '@prisma/client'
import React, { useEffect } from 'react'
import { api } from '~/utils/api'

export default function Line(props: {user: User, projects: Project[] | undefined, userprojects: Project[], handleChangeRole: (id: string, checked: boolean) => Promise<void>, refetch: () => Promise<void>}) {
  // const [q, setq] = React.useState('')
  const [values, setValues] = React.useState<string[]>(() => props.userprojects?.map(e => e.id) ?? [])
  const {mutateAsync: updateProjectsForUser} = api.admin.updateProjectsForUser.useMutation()
  const handleChange = async () => {
      await updateProjectsForUser({
          id: props.user.id,
          projects: values
      })
      await props.refetch()
  }
  useEffect(() => {
      void handleChange()
  }, [values])

    return (
    <>
     <td>{props.user.name}</td>
              <td>{props.user.email}</td>
              <td><input type="checkbox" className="checkbox-primar checkbox-md" checked={props.user.role === "admin"} onChange={(e) => { props.handleChangeRole(props.user.id,e.target.checked).catch(e => console.log(e))}} /></td>
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
              </td>
    </>
  )
}
