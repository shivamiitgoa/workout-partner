import "styles/tailwind.css"
import { Metadata } from "next"
import { WorkoutProvider } from "components/IntervalTimer/WorkoutContext"

export const metadata: Metadata = {
  title: "Workout Partner",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </body>
    </html>
  )
}
