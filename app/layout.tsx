import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'PyroTrace AI MVP', description: 'Gestión pirométrica, programación de pruebas y reportes' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
