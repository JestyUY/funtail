// components/DashboardButton.jsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardButton() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <Link href="/dashboard">
        <span className="text-java-300 hover:text-java-50 font-light text-md decoration-java-500">
          Dashboard
        </span>
      </Link>
    );
  }

  return null;
}
