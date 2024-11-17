'use client';

import { useAuth, SignedOut, SignedIn, SignInButton, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        console.log(result);
      } else {
        console.log(response.statusText, response.status);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start"></main>

    </div>
  );
}
