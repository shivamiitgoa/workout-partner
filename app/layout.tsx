import "styles/tailwind.css"
import { Metadata, Viewport } from "next"
import { WorkoutProvider } from "components/IntervalTimer/WorkoutContext"
import { AuthProvider } from "../contexts/AuthContext"
import { SidebarProvider } from "../contexts/SidebarContext"

export const metadata: Metadata = {
  title: "Super App",
  description: "Your all-in-one application hub with workout companion, games, and more",
  icons: {
    icon: "/icon.svg",
  },
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
        <AuthProvider>
          <SidebarProvider>
            <WorkoutProvider>
              {children}
            </WorkoutProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
