import type { Metadata, Viewport } from 'next'
import './globals.css'
import './koku2.css'

/**
 * Not translated, unlike the rest of the app.
 *
 * This is the ROOT layout: it renders for signed-out pages too and has no
 * idea whose request this is. Localising the tab title would mean a database
 * read on every single page load to fill one attribute nobody reads twice —
 * and "Lesson Studio" is a product name that would not change anyway.
 *
 * <html lang> IS kept honest; I18nProvider sets it after mount.
 */
export const metadata: Metadata = {
  title: 'Lesson Studio',
  description: 'Bookings, recorded lessons, and AI recaps for language teachers.',
  // Added to home screen on iOS this opens as its own app: no Safari chrome,
  // its own icon, its own name under it. `manifest` covers Android the same
  // way for free. No service worker on purpose — the app is useless offline
  // and a stale-cache bug is worse than a network error.
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lesson Studio',
  },
  /**
   * The tab icon was never declared, only the iOS one — so the app that a
   * teacher keeps pinned all day showed the browser's blank page glyph beside
   * six other tabs. The small sizes are their own files rather than a 512 left
   * for the browser to shrink, because that downscale is done at paint time
   * with no filtering and turns the two bars into grey mush.
   */
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

/**
 * Stated rather than inherited from the framework default, because the obvious
 * "fix" for iOS focus-zoom is to add maximumScale:1 here — and that takes
 * pinch-zoom away from every student who needs it, on every page, to solve a
 * problem that belongs to one CSS rule. The real cure is a 16px form control;
 * see the pointer:coarse block in koku2.css. Leave this alone.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Paints the iOS status bar / Android toolbar in the brand rather than grey.
  themeColor: '#0a61c9',
  // Standalone mode ignores safe areas unless asked — without this the app
  // draws under the notch and the home indicator.
  viewportFit: 'cover',
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
