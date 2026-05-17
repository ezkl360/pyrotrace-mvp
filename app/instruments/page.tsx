import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { statusBadge } from "@/lib/status";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    include: {
      organization: true,
      correctionFactors: {
        where: {
          active: true,
        },
        orderBy: {
          nominalTemperature: "asc",
        },
      },
    },
    orderBy: {
      instrumentCode: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Instrumentos de campo</h1>
          <p className="mt-2 text-slate-600">
            Administra instrumentos usados en SAT, calibraciones y pruebas de
            campo. Cada instrumento puede tener factores de corrección por
            temperatura.
          </p>
        </div>

        <a
          href="/instruments/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo instrumento
        </a>
      </div>

      <Card title="Instrumentos registrados">
        {instruments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay instrumentos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Empresa</th>
                  <th>Serie</th>
                  <th>Vence calibración</th>
                  <th>Factores activos</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">
                      {instrument.instrumentCode}
                    </td>

                    <td className="font-medium">{instrument.name}</td>

                    <td>{instrument.type}</td>

                    <td>{instrument.organization.name}</td>

                    <td>{instrument.serialNumber ?? "—"}</td>

                    <td>{formatDate(instrument.calibrationDue)}</td>

                    <td>{instrument.correctionFactors.length}</td>

                    <td>
                      <span className={statusBadge(instrument.status)}>
                        {instrument.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Shell>
  );
}
