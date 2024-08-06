"use client";

import Link from "next/link";
import DashboardButton from "./dashboard-button";
import { FuntailIcon } from "./funtail-logo";
import { auth } from "@/lib/auth";
import SignInBtnAuto from "./signin-btn-auto";

export default function MainHeader() {
  return (
    <header className="absolute top-0 z-20 w-full px-4 md:px-6 lg:px-10">
      <nav className="flex flex-wrap items-center justify-between h-16 md:h-14 bg-opacity-20 backdrop-blur-md">
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex gap-2 md:gap-3 items-center">
            <FuntailIcon fontSize={"30px"} color="#ffffffff" />
            <span className="text-lg md:text-xl font-semibold text-white">
              funtail
            </span>
          </Link>
        </div>

        <div className="block sm:hidden">
          <button
            className="flex items-center px-3 py-2 text-java-300 hover:text-java-50 border border-java-300 rounded-md"
            onClick={() => {
              const menu = document.getElementById("mobile-menu");
              menu?.classList.toggle("hidden");
            }}
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>

        <div
          id="mobile-menu"
          className="w-full hidden md:flex md:items-center md:justify-center md:w-auto"
        >
          <div className="flex flex-col md:flex-row md:gap-4">
            <DashboardButton />
            <Link href="/about">
              <span className="block mt-4 md:inline-block md:mt-0 text-java-300 hover:text-java-50 font-light text-md decoration-java-500">
                About
              </span>
            </Link>
            <Link href="/funtail-info">
              <span className="block mt-4 md:inline-block md:mt-0 text-java-300 hover:text-java-50 font-light text-md decoration-java-500">
                What is a funtail?
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <SignInBtnAuto />
        </div>
      </nav>
    </header>
  );
}
