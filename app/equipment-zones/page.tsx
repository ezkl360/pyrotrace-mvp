import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { statusBadge } from "@/lib/status";

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "°C";
  if (value === "FAHRENHEIT") return "°F";
  return value;
}

function formatRange(min: number | null, max: number | null, unit: string) {
  if (min === null && max === null) return "—";
  if (min !== null && max !== null) return `${min} ${unit} - ${max} ${unit}`;
  if (min !== null) return `Desde ${min} ${unit}`;
  if (max !== null) return `Hasta ${max} ${unit}`;
  return "—";
}

export default async function EquipmentZonesPage() {
  const zones = await prisma.equipmentZone.findMany({
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
    },
    orderBy: [
      {
        equipment: {
          equipmentCode: "asc",
        },
      },
      {
        zoneCode: "asc",
      },
    ],
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Zonas de equipo</h1>
          <p className="mt-2 text-slate-600">
            Administra las zonas de calentamiento, control o calibración de cada
            horno/equipo. Cada zona puede tener su propia temperatura operativa
            mínima y máxima, y requerir SAT o calibración independiente.
          </p>
        </div>

        <a
          href="/equipment-zones/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nueva zona
        </a>
      </div>

      <Card title="Zonas registradas">
        {zones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay zonas registradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Equipo</th>
                  <th>Zona</th>
                  <th>Nombre</th>
                  <th>Sitio</th>
                  <th>Cliente</th>
                  <th>Temperatura operativa</th>
                  <th>Temperatura nominal</th>
                  <th>Requiere SAT</th>
                  <th>Requiere calibración</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {zones.map((zone) => {
                  const unit = formatTemperatureUnit(
                    zone.equipment.temperatureUnit
                  );

                  return (
                    <tr key={zone.id} className="border-b last:border-0">
                      <td className="py-3">
                        {zone.equipment.equipmentCode} — {zone.equipment.name}
                      </td>

                      <td className="font-mono text-xs">{zone.zoneCode}</td>

                      <td>{zone.name}</td>

                      <td>{zone.equipment.site.name}</td>

                      <td>
                        {zone.equipment.site.customerOrganization?.name ??
                          "Interno"}
                      </td>

                      <td>
                        {formatRange(
                          zone.operatingMin,
                          zone.operatingMax,
                          unit
                        )}
                      </td>

                      <td>
                        {zone.nominalSetpoint !== null
                          ? `${zone.nominalSetpoint} ${unit}`
                          : "—"}
                      </td>

                      <td>{zone.requiresSat ? "Sí" : "No"}</td>

                      <td>{zone.requiresCalibration ? "Sí" : "No"}</td>

                      <td>
                        <span className={statusBadge(zone.status)}>
                          {zone.status}
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
