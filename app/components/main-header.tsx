

import Link from "next/link";
import { FuntailIcon } from "./funtail-logo";
import { auth } from "@/lib/auth";
import SignInBtnAuto from "./signin-btn-auto";
import SigninBtnCustom from "./signin-btn-custom";
import github from "next-auth/providers/github";

export default async function MainHeader() {
const session = await auth()

    return (
        <header>
            <nav className="flex items-center w-screen h-14 border-b border-gray-200 justify-between px-10 bg-indigo-950 bg-opacity-20 backdrop-blur-sm ">
               
             
            <Link href="/" className="flex gap-3 items-center">
                <FuntailIcon fontSize={"40px"} color="#ffffffff" />
                <span className="text-xl font-semibold text-white">funtail</span>
               </Link>
              


<SignInBtnAuto/>
                
            </nav>
        </header>
    )
}