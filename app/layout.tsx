import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/hooks/use-theme"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Team Task Dashboard",
  description: "Collaborative task management for teams",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider defaultTheme="system" storageKey="team-dashboard-theme">
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
