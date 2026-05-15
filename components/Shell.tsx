import Link from 'next/link';
import { ReactNode } from 'react';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Empresas', '/companies'],
  ['Equipos', '/equipment'],
  ['Programación de pruebas', '/tests'],
  ['Storage de reportes', '/reports'],
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-72 border-r bg-white p-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">PyroTrace AI</p>
          <h1 className="mt-1 text-2xl font-bold">MVP pirometría</h1>
        </div>
        <nav className="space-y-2">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="ml-72 p-8">{children}</main>
    </div>
  );
}
