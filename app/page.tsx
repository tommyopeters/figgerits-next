'use client';

import { SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response.ok, response.status);
    };

    fetchData();
  }, []);


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SignedOut>
        <SignInButton><button>Get access to Figgerits</button></SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          This is the main content that only shows up when you're logged in.
        </main>
      </SignedIn>

    </div>
  );
}
