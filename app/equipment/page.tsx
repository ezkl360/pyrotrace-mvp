import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { statusBadge } from "@/lib/status";

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

function formatAmsClass(value: string) {
  const labels: Record<string, string> = {
    NOT_APPLICABLE: "No aplica",
    CLASS_1: "Clase 1",
    CLASS_2: "Clase 2",
    CLASS_3: "Clase 3",
    CLASS_4: "Clase 4",
    CLASS_5: "Clase 5",
    CLASS_6: "Clase 6",
  };

  return labels[value] ?? value;
}

function formatInstrumentation(value: string) {
  const labels: Record<string, string> = {
    NOT_APPLICABLE: "No aplica",
    TYPE_A: "Tipo A",
    TYPE_B: "Tipo B",
    TYPE_C: "Tipo C",
    TYPE_D: "Tipo D",
    TYPE_E: "Tipo E",
  };

  return labels[value] ?? value;
}

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({
    include: {
      site: {
        include: {
          ownerOrganization: true,
          customerOrganization: true,
        },
      },
    },
    orderBy: {
      equipmentCode: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Equipos térmicos</h1>
          <p className="mt-2 text-slate-600">
            Cada equipo queda ligado a sitio, empresa operadora, empresa cliente
            y norma aplicable.
          </p>
        </div>

        <a
          href="/equipment/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo equipo
        </a>
      </div>

      <Card title="Activos registrados">
        {equipment.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay equipos térmicos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Código</th>
                  <th>Equipo</th>
                  <th>Sitio</th>
                  <th>Proveedor / dueño</th>
                  <th>Cliente</th>
                  <th>Norma</th>
                  <th>Clase AMS</th>
                  <th>Instrumentación</th>
                  <th>Rango</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {equipment.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">
                      {e.equipmentCode}
                    </td>
                    <td>{e.name}</td>
                    <td>{e.site.name}</td>
                    <td>{e.site.ownerOrganization.name}</td>
                    <td>{e.site.customerOrganization?.name ?? "Interno"}</td>
                    <td>{formatStandard(e.applicableStandard)}</td>
                    <td>{formatAmsClass(e.amsFurnaceClass)}</td>
                    <td>{formatInstrumentation(e.amsInstrumentationType)}</td>
                    <td>{e.operatingRange ?? "—"}</td>
                    <td>
                      <span className={statusBadge(e.status)}>
                        {e.status}
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
