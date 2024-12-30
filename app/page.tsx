'use client';

import { redirect } from 'next/navigation';
import { SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';

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

      if (response.ok) {
        redirect('/figgerits');
      }
    };

    fetchData();
  }, []);


  return (
    <>
      <SignedOut>
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <SignInButton><Button>Get access to Figgerits</Button></SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton />
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <Countdown />
        </main>
      </SignedIn>
    </>
  );
}

// create a countdown component that redirects to /figgerits after 5 seconds with a visual countdown

const Countdown = () => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (count === 0) {
      redirect('/figgerits');
    }
  }, [count]);

  return (
    <div>
      <p>You&apos;re logged in. Redirecting to Figgerits in {count} seconds...</p>
    </div>
  );
}