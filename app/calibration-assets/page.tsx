import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { statusBadge } from "@/lib/status";

function formatAssetType(value: string) {
  const labels: Record<string, string> = {
    PRIMARY_STANDARD: "Patrón primario",
    SECONDARY_STANDARD: "Patrón secundario",
    FIELD_TEST_INSTRUMENT: "Instrumento de prueba de campo",
    EQUIPMENT_INSTRUMENTATION: "Instrumentación del equipo",
    TEST_THERMOCOUPLE: "Termopar de prueba",
    REFERENCE_STANDARD: "Patrón de referencia",
    OTHER: "Otro",
  };

  return labels[value] ?? value;
}

export default async function CalibrationAssetsPage() {
  const assets = await prisma.calibrationAsset.findMany({
    include: {
      organization: true,
      calibrationsAsCalibrated: {
        where: {
          active: true,
        },
        orderBy: {
          calibrationDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      assetCode: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Activos metrológicos</h1>
          <p className="mt-2 text-slate-600">
            Registra patrones primarios, patrones secundarios, instrumentos de
            prueba de campo, termopares de prueba e instrumentación del equipo.
            Estos activos forman la cadena de trazabilidad metrológica.
          </p>
        </div>

        <a
          href="/calibration-assets/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo activo
        </a>
      </div>

      <Card title="Activos registrados">
        {assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay activos metrológicos registrados todavía.
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
                  <th>Última calibración</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => {
                  const latestCalibration = asset.calibrationsAsCalibrated[0];

                  return (
                    <tr key={asset.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">
                        {asset.assetCode}
                      </td>

                      <td className="font-medium">{asset.name}</td>

                      <td>{formatAssetType(asset.type)}</td>

                      <td>{asset.organization.name}</td>

                      <td>{asset.serialNumber ?? "—"}</td>

                      <td>
                        {latestCalibration
                          ? latestCalibration.calibrationDate.toLocaleDateString(
                              "es-MX"
                            )
                          : "—"}
                      </td>

                      <td>
                        {latestCalibration?.dueDate
                          ? latestCalibration.dueDate.toLocaleDateString(
                              "es-MX"
                            )
                          : "—"}
                      </td>

                      <td>
                        <span className={statusBadge(asset.status)}>
                          {asset.status}
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
