import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { Nav } from "@/components/nav";
import { BinIntroDialog } from "@/components/bin/bin-intro-dialog";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MGSA Peer Elective Guide",
  description: "Peer course reviews for Marshall MBA students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <BinIntroDialog />
      </body>
    </html>
  );
}
