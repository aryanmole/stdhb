import './globals.css'

export const metadata = { title: 'Student Hub' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
