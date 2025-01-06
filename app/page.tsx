'use client';

import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { useEffect, useTransition } from "react";
import { Button } from '@/components/ui/button';
import Figgerits from '@/components/Figgerits';
import { handleAuth } from "./actions/authActions";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    const authenticate = async () => {
      const response = await handleAuth();
      console.log(response);
    };
  

    startTransition(() => {
      authenticate();
    });
  }, [startTransition]);


  return (
    <>
      <SignedOut>
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <SignInButton><Button>Get access to Figgerits</Button></SignInButton>
        </div>
      </SignedOut>
      {/* <SignedIn>
        <UserButton />
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <Countdown />
        </main>
      </SignedIn> */}
      <SignedIn>
        {!isPending && <Figgerits />}
      </SignedIn>
    </>
  );
}