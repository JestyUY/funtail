import Link from "next/link";
import { FuntailIcon } from "./funtail-logo";
import { auth } from "@/lib/auth";
import SignInBtnAuto from "./signin-btn-auto";
import SigninBtnCustom from "./signin-btn-custom";
import github from "next-auth/providers/github";

export default async function MainHeader() {
  const session = await auth();

  return (
    <header className="absolute top-0 z-20">
      <nav className="flex items-center w-screen h-14  justify-between px-10 bg-opacity-20 backdrop-blur-sm bg-java-300 sticky">
        <Link href="/" className="flex gap-3 items-center">
          <FuntailIcon fontSize={"40px"} color="#ffffffff" />
          <span className="text-xl font-semibold text-white">funtail</span>
        </Link>
        <div className="gap-4 flex ">
          <Link href="/dashboard">
            {session?.user ? (
              <span className="text-java-200 hover:text-java-50 font-light text-md  decoration-java-500">
                Dashboard
              </span>
            ) : (
              ""
            )}
          </Link>
          <Link href="/about">
            <span className="text-java-200 hover:text-java-50 font-light text-md  decoration-java-500">
              About
            </span>
          </Link>
          <Link href="/funtail-info">
            <span className="text-java-200 hover:text-java-50 font-light text-md  decoration-java-500">
              what is a funtail?
            </span>
          </Link>
        </div>

        <SignInBtnAuto />
      </nav>
    </header>
  );
}
