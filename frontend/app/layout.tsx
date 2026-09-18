'use client'
import "@/app/globals.css";

export default function Rootlayout({children} : {children  :React.ReactNode}) {
  return <html lang="ar">
      <body>{children}</body>
    </html>;
    
}
