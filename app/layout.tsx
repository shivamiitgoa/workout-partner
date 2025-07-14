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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="overflow-hidden">
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </body>
    </html>
  )
}
