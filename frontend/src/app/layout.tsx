import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Autism Behavioural Checklist (TABC)',
  description: 'Thundersoft Autism Behavioural Checklist (TABC) Web Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-sm py-4">
            <div className="container mx-auto px-4 max-w-5xl">
              <h1 className="text-xl font-semibold text-blue-900">
                Thundersoft Autism Behavioural Checklist
              </h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </main>
          <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
            <p>This tool is intended for educational screening purposes only.</p>
            <p className="mt-1">~A project by Meghan</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
