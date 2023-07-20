import { Button } from "@/components/ui/button";
import { type IncomingMessage, type ServerResponse } from "http";
import { signIn } from "next-auth/react";
import { getServerAuthSession } from "~/server/auth";


export default function Home() {
    
  
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-900 text-center font-semibold text-white">
      <div className="text-5xl mt-4 font-bold">Zarządzanie urlopami</div>
      <button className="btn btn-neutral text-white border-none mt-4" onClick={() => void signIn("google")}>Zaloguj</button>
    </div>
  );
}

export async function getServerSideProps(ctx: { req: IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; }; res: ServerResponse<IncomingMessage>; }) {
  const session = await getServerAuthSession(ctx);
 if (session?.user.role === "user" || session?.user.role === "admin") {
    return {
      redirect: {
        destination: "/vacations",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}
  