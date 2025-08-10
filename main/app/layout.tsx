import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
            // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
