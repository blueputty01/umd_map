import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMD Room Availability',
  description: 'Find available rooms on the University of Maryland campus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
