import Link from "next/link";
import { ReactNode } from "react";

const nav = [
  {
    section: "General",
    items: [
      ["Dashboard", "/"],
      ["Empresas", "/organizations"],
      ["Sitios / Plantas", "/sites"],
      ["Equipos térmicos", "/equipment"],
    ],
  },
  {
    section: "Pruebas",
    items: [
      ["Programación", "/test-schedules"],
      ["Reglas de cumplimiento", "/compliance-rules"],
      ["SAT", "/sat-records"],
      ["TUS", "/tus-records"],
      ["Calibraciones", "/calibrations"],
      ["Pruebas de alarmas", "/alarm-tests"],
      ["Otras pruebas", "/other-tests"],
    ],
  },
  {
    section: "Activos y evidencia",
    items: [
      ["Termopares / sensores", "/thermocouples"],
      ["Reportes / Storage", "/documents"],
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-72 overflow-y-auto border-r bg-white p-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            PyroTrace AI
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            MVP pirometría
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Cumplimiento, trazabilidad, pruebas, reportes y evidencia
            pirométrica.
          </p>
        </div>

        <nav className="space-y-6">
          {nav.map((group) => (
            <div key={group.section}>
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="ml-72 min-h-screen p-8">{children}</main>
    </div>
  );
}
