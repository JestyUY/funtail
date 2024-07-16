import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Akshar, Roboto } from "next/font/google";

const akshar = Akshar({
  weight: "400",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className={roboto.className}>{children}</div>
    </SessionProvider>
  );
}
