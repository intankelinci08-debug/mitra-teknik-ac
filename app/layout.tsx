import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mitra Teknik AC",
  description: "Jasa Engineering AC Profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          body {
            background-color: #f3f4f6;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}