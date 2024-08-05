"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInBtnAuto() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  if (!isClient) {
    return null;
  }

  if (pathname === "/signin-auto") {
    return null;
  }

  if (session) {
    return (
      <div className="gap-2 flex items-center">
        <span className="text-white font-thin">
          signed in as {session.user?.name}
        </span>
        <button
          onClick={handleSignOut}
          className="border p-1 px-2 rounded-md border-java-200 hover:bg-java-500 text-java-100 font-semibold"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/signin-auto")}
      className="border p-1 px-2 rounded-md border-java-200 hover:bg-java-500 text-java-50 font-semibold"
    >
      Log In
    </button>
  );
}
