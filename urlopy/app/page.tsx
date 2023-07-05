// "use client"
import Image from 'next/image'
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { getServerSession, unstable_getServerSession } from 'next-auth'

export default async function Home() {
  const sesion = await getServerSession()
  return (
    <main className="flex  flex-col items-center justify-between p-24">
      {/* <Button></Button> */}
     <div className='text-white'>
     {sesion?.user?.email}
     </div>
    </main>
  )
}
