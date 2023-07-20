import { type IncomingMessage, type ServerResponse } from 'http'
import Link from 'next/link'
import React from 'react'
import { getServerAuthSession } from '~/server/auth'


export default function Page() {


  return (
    <div className='flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white p-24 items-center'>
      <div>
      <Link className='btn mb-4 text-white w-2/3' href="/admin/users">Zarządzanie urzytkownikami</Link>
      <Link className='btn mb-4 text-white w-2/3' href="/admin/check">Sprawdź team</Link>
      </div>


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