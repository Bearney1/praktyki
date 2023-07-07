import { useRouter } from 'next/router'
import React from 'react'

export default function Page() {
    const router = useRouter()
  return (
    <div className='flex min-h-screen flex-col bg-neutral-900 text-center font-semibold text-white  p-24 items-center'>
        <h1 className='text-4xl'>Admin {router.query.slug}</h1>
    </div>
  )
}
