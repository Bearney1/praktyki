import Link from 'next/link'
import React from 'react'
import { api } from '~/utils/api'

export default function Page() {
  const [query, setQuery] = React.useState('')
  const {data, status,error} = api.admin.getAllProjects.useQuery({q:query})

  return (
    <div className='flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white  p-24 items-center'>
      <input className='input mb-4' placeholder='Nazwa projektu' onChange={(e) => setQuery(e.target.value)}/>
      {status === 'loading' && <span className="loading loading-spinner loading-lg"></span>}
      {status === 'error' && <span>Error: {error.message}</span>}
      {data?.map((project) => (
        <Link key={project.id} className='text-4xl mb-4' href={`/admin/${project.id}`}>{project.name}</Link>
      ))}

    </div>
  )
}
