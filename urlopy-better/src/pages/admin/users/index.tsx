import { MultiSelect } from '@mantine/core';
import { type IncomingMessage, type ServerResponse } from 'http';
import React from 'react'
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/utils/api';

export default function Index() {
    const { data, status, error } = api.admin.getAllUsers.useQuery();
  return (
    <div className='flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white p-24 items-center'>
        {status === 'loading' && <span className="loading loading-spinner loading-lg"></span>}
        {status === 'error' && <span>Error: {error.message}</span>}
        <table className='table'>
            <thead>
                <tr>
                    <th>Imię</th>
                    <th>Email</th>
                    <th>Rola</th>
                    <th>Projekty</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                        <MultiSelect
      data={['React', 'Angular', 'Svelte', 'Vue', 'Riot', 'Next.js', 'Blitz.js']}
      label="Your favorite frameworks/libraries"
      placeholder="Pick all that you like"
      searchable
      searchValue={"fdf"}
      onSearchChange={(e) => console.log(e)}
      nothingFound="Nothing found"
    />
                            {user.Project.map((e) => <div className="badge mr-2" key={e.id}>{e.name}</div>)}</td>

                    </tr>
                ))}
            </tbody>
        </table>

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