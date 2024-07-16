import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "./components/main-header";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "funtail",
  description: "AI image storage and optimizer for developers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body
          className={`${inter.className} bg-gradient-to-t from-java-900 to-java-600 h-screen`}
        >
          <MainHeader />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
