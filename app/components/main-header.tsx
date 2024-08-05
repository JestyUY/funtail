import Link from "next/link";
import DashboardButton from "./dashboard-button";
import { FuntailIcon } from "./funtail-logo";
import { auth } from "@/lib/auth";
import SignInBtnAuto from "./signin-btn-auto";

export default async function MainHeader() {
  const session = await auth();

  return (
    <header className="absolute top-0 z-20 w-full px-10">
      <nav className="flex items-center h-14 justify-between bg-opacity-20 backdrop-blur-sm">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex gap-3 items-center">
            <FuntailIcon fontSize={"40px"} color="#ffffffff" />
            <span className="text-xl font-semibold text-white">funtail</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center gap-4">
          <DashboardButton />
          <Link href="/about">
            <span className="text-java-300 hover:text-java-50 font-light text-md decoration-java-500">
              About
            </span>
          </Link>
          <Link href="/funtail-info">
            <span className="text-java-300 hover:text-java-50 font-light text-md decoration-java-500">
              what is a funtail?
            </span>
          </Link>
        </div>

        <div className="flex-1 flex justify-end">
          <SignInBtnAuto />
        </div>
      </nav>
    </header>
  );
}
