import "styles/tailwind.css"
import { WorkoutProvider } from "components/IntervalTimer/WorkoutContext"

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
