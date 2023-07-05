"use client"
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

export default function Navbar() {
    const {data: session} = useSession()
    const state = () => {
        if (!session) {
            return <Button variant="default" onClick={()=>signIn()}>Zaloguj</Button>
        } else {
            return <Button variant="default" onClick={()=>signOut()}>Wyloguj</Button>
        }
    }
  return (
    <div className="w-full flex justify-between">
        <></>
        {state()}
    </div>
  );
}
