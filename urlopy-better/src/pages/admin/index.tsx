import { IncomingMessage, ServerResponse } from 'http'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/utils/api'

interface Project {
  id: string
  name: string
  includeMe : boolean
}

export default function Page() {
  const sesion = useSession()
  const [query, setQuery] = React.useState('')
  const {data, status,error} = api.admin.getAllProjects.useQuery({q:query})
  const [myData, setMyData] = React.useState<Project[]>([])
  React.useEffect(() => {
    
    if (data && sesion.data?.user) {
      let a: Project[] = []
      let b: Project[] = []
      data.forEach((project) => {
        if (project.users.find((user) => {return user.id === sesion.data?.user?.id})) {
          const p: Project = {
            id: project.id,
            name: project.name,
            includeMe: true
          }
          a = [...a, p]
        } else {
          const p: Project = {
            id: project.id,
            name: project.name,
            includeMe: false
          }
          b = [...b, p]
        }
      })
      setMyData([...a, ...b])
    }
  }, [data, sesion])

  return (
    <div className='flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white  p-24 items-center'>
      <input className='input mb-4' placeholder='Nazwa projektu' onChange={(e) => setQuery(e.target.value)}/>
      {status === 'loading' && <span className="loading loading-spinner loading-lg"></span>}
      {status === 'error' && <span>Error: {error.message}</span>}
      {myData?.map((project) => (
        <Link key={project.id} className='text-4xl mb-4' href={`/admin/${project.id}`}>{project.name} 
        {project.includeMe && <span className='text-green-500'> (w tym projekcie)</span>}
        </Link>
      ))}

    </div>
  )
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