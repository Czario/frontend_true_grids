import type { Metadata } from "next";
import "@/styles/globals.css";


export const metadata: Metadata = {
  title: "TrueGrids",
  description: "Data Quality is our major concern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
