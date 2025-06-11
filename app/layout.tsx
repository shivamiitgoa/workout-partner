import "styles/tailwind.css"
import { Metadata, Viewport } from "next"
import { WorkoutProvider } from "components/IntervalTimer/WorkoutContext"

export const metadata: Metadata = {
  title: "Workout Partner",
  description: "Your personal workout companion with timer, music, and workout plans",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://next-enterprise.vercel.app/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "https://raw.githubusercontent.com/Blazity/next-enterprise/main/.github/assets/project-logo.png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Workout Partner",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Workout Partner" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-navbutton-color" content="#6366f1" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="overflow-hidden">
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </body>
    </html>
  )
}
