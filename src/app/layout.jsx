import { Inter } from 'next/font/google'
import '@/index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'High-Growth Digital - AI Marketing Pro',
  description: 'Your technical co-pilot for go-to-market strategy, outbound automation, and tech stack integration.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 