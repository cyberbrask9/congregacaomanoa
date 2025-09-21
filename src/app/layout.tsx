import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Congregação Manoa',
  description: 'Toda Groria a Jeová! ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}