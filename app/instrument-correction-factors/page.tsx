import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "°C";
  if (value === "FAHRENHEIT") return "°F";
  return value;
}

export default async function InstrumentCorrectionFactorsPage() {
  const factors = await prisma.instrumentCorrectionFactor.findMany({
    include: {
      instrument: {
        include: {
          organization: true,
        },
      },
    },
    orderBy: [
      {
        instrument: {
          instrumentCode: "asc",
        },
      },
      {
        nominalTemperature: "asc",
      },
    ],
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Factores de corrección de instrumentos
          </h1>
          <p className="mt-2 text-slate-600">
            Registra factores de corrección por temperatura para instrumentos de
            campo. Estos factores serán usados automáticamente en cálculos SAT y
            calibraciones.
          </p>
        </div>

        <a
          href="/instrument-correction-factors/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo factor
        </a>
      </div>

      <Card title="Factores registrados">
        {factors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay factores de corrección registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Instrumento</th>
                  <th>Empresa</th>
                  <th>Temperatura nominal</th>
                  <th>Factor de corrección</th>
                  <th>Incertidumbre</th>
                  <th>Certificado</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {factors.map((factor) => {
                  const unit = formatTemperatureUnit(factor.temperatureUnit);

                  return (
                    <tr key={factor.id} className="border-b last:border-0">
                      <td className="py-3">
                        <span className="font-mono text-xs">
                          {factor.instrument.instrumentCode}
                        </span>{" "}
                        — {factor.instrument.name}
                      </td>

                      <td>{factor.instrument.organization.name}</td>

                      <td>
                        {factor.nominalTemperature} {unit}
                      </td>

                      <td>
                        {factor.correctionFactor >= 0 ? "+" : ""}
                        {factor.correctionFactor} {unit}
                      </td>

                      <td>
                        {factor.uncertainty !== null
                          ? `±${factor.uncertainty} ${unit}`
                          : "—"}
                      </td>

                      <td>{factor.certificateNumber ?? "—"}</td>

                      <td>
                        <span
                          className={
                            factor.active
                              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          }
                        >
                          {factor.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Shell>
  );
}
