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
        <body
          className={`${montserrat.className} bg-black flex flex-col min-h-screen`}
        >
          <MainHeader />

          <main className="flex-grow">{children}</main>

          <footer className="bg-gray-900 bg-opacity-20 text-java-50 py-6">
            <div className="container mx-auto text-center">
              <p className="text-sm sm:text-base">
                Made with 💟 by{" "}
                <Link
                  className="text-blue-400 hover:text-blue-500 hover:underline"
                  target="_blank"
                  href="https://www.linkedin.com/in/martin-sosa-64b940241/"
                >
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
