import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";

function formatStandard(value: string) {
  const labels: Record<string, string> = {
    AMS2750: "AMS2750",
    AMS2770: "AMS2770",
    CQI_9: "CQI-9",
    CQI_11: "CQI-11",
    CQI_12: "CQI-12",
    CUSTOMER_SPECIFIC: "Cliente específico",
    OTHER: "Otra",
  };

  return labels[value] ?? value;
}

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "°C";
  if (value === "FAHRENHEIT") return "°F";
  return value;
}

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function SatRecordsPage() {
  const records = await prisma.pyrometryRecord.findMany({
    where: {
      type: "SAT",
    },
    include: {
      equipment: {
        include: {
          site: {
            include: {
              ownerOrganization: true,
              customerOrganization: true,
            },
          },
        },
      },
      complianceRule: true,
      satRecord: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">SAT Records</h1>
          <p className="mt-2 text-slate-600">
            Captura SAT con cálculo automático de error, tolerancia desde regla
            de cumplimiento y resultado PASS / FAIL.
          </p>
        </div>

        <a
          href="/sat-records/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo SAT
        </a>
      </div>

      <Card title="SAT capturados">
        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay SAT capturados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Fecha</th>
                  <th>Equipo</th>
                  <th>Sitio</th>
                  <th>Norma</th>
                  <th>Setpoint</th>
                  <th>Error</th>
                  <th>Tolerancia</th>
                  <th>Resultado</th>
                  <th>Regla</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => {
                  const unit = formatTemperatureUnit(
                    record.equipment.temperatureUnit
                  );

                  return (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="py-3">{formatDate(record.performedAt)}</td>

                      <td>
                        {record.equipment.equipmentCode} —{" "}
                        {record.equipment.name}
                      </td>

                      <td>{record.equipment.site.name}</td>

                      <td>{formatStandard(record.equipment.applicableStandard)}</td>

                      <td>
                        {record.satRecord
                          ? `${record.satRecord.setpoint} ${unit}`
                          : "—"}
                      </td>

                      <td>
                        {record.satRecord
                          ? `${record.satRecord.error.toFixed(2)} ${unit}`
                          : "—"}
                      </td>

                      <td>
                        {record.complianceRule?.toleranceLabel ??
                          (record.tolerance
                            ? `±${record.tolerance} ${unit}`
                            : "—")}
                      </td>

                      <td>
                        <span
                          className={
                            record.result === "PASS"
                              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {record.result ?? "—"}
                        </span>
                      </td>

                      <td>{record.complianceRule?.name ?? "Sin regla"}</td>
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
