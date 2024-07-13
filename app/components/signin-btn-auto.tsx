"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation";

export default function SignInBtnAuto() {
    const { data: session } = useSession()
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/signin-auto') {
        return null; // Don't show anything on the sign-in page
    }

    if (session) {
        return (
            <div className="gap-2 flex items-center">
                <span className="text-white font-thin"> signed in as {session.user?.name}</span>
                <button 
                    onClick={() => signOut()} 
                    className="border p-1 rounded-md bg-indigo-100 hover:bg-indigo-200 text-black"
                >
                    Sign Out
                </button>
            </div>
        )
    }

    return (
        <button 
            onClick={() => router.push('/signin-auto')}
            className="border p-1 rounded-md bg-indigo-100 hover:bg-indigo-200 text-black font-semibold"
        >
            Sign In
        </button>
    )
}