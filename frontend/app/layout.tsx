import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coli Code Editor",
  description:
    "A collaborative code editor built with Monaco Editor and Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolageGrotesque.variable} font-bricolage antialiased`}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
