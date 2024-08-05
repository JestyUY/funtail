import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import MainHeader from "./components/main-header";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });
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
        <body className={`${montserrat.className} bg-black`}>
          <MainHeader />

          {children}
          <footer className="w-full">
            <div className="flex justify-center items-center h-20 bg-gray-900 bg-opacity-20 text-java-50  ">
              <p>
                made with 💟 by
                <Link
                  className="text-blue-800"
                  target="_blank"
                  href="https://www.linkedin.com/in/martin-sosa-64b940241/"
                >
                  {" "}
                  Martin Sosa
                </Link>
              </p>
            </div>
          </footer>
        </body>
      </html>
    </SessionProvider>
  );
}
