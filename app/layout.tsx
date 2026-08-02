import type { Metadata } from 'next'
import './globals.css'
import './koku2.css'

export const metadata: Metadata = {
  title: 'Lesson Studio',
  description: 'Bookings, recorded lessons, and AI recaps for language teachers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Outfit + Jakarta dress the teacher tooling. The rest back the font
            pairings a teacher can pick for their student portal (lib/brand
            FONTS) — they only load once, for every teacher's choice. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:wght@400;600;700;800&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
