import Link from 'next/link'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProvider } from '@/lib/redux/ReduxProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import ClientDirectionWrapper from '@/components/ClientDirectionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  icons: {
    icon: '/event.avif',
  },
  title: 'EventHub',
  description: 'Book tickets for conferences, concerts, workshops and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <ReduxProvider>
            <ClientDirectionWrapper>
              <div className="min-h-screen bg-primary transition-colors">
                <Navbar />
                <main>{children}</main>
                <Footer />
              </div>
            </ClientDirectionWrapper>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}