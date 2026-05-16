import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";

function formatTestType(value: string) {
  const labels: Record<string, string> = {
    SAT: "SAT",
    TUS: "TUS",
    CALIBRATION: "Calibración",
    THERMOCOUPLE_USAGE: "Uso de termopar",
    MAINTENANCE_CHECK: "Revisión de mantenimiento",
  };

  return labels[value] ?? value;
}

function formatScheduleStatus(value: string) {
  const labels: Record<string, string> = {
    PLANNED: "Planeada",
    DUE_SOON: "Próxima a vencer",
    IN_PROGRESS: "En proceso",
    COMPLETED: "Completada",
    OVERDUE: "Vencida",
    CANCELLED: "Cancelada",
  };

  return labels[value] ?? value;
}

function scheduleStatusBadge(value: string) {
  const styles: Record<string, string> = {
    PLANNED: "bg-blue-100 text-blue-700",
    DUE_SOON: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-cyan-100 text-cyan-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  };

  return `rounded-full px-3 py-1 text-xs font-semibold ${
    styles[value] ?? "bg-slate-100 text-slate-600"
  }`;
}

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function TestSchedulesPage() {
  const schedules = await prisma.testSchedule.findMany({
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
      assignedTo: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Programación de pruebas</h1>
          <p className="mt-2 text-slate-600">
            Agenda pruebas SAT, TUS, calibraciones, revisiones y controles de
            termopares por equipo térmico.
          </p>
        </div>

        <a
          href="/test-schedules/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nueva programación
        </a>
      </div>

      <Card title="Pruebas programadas">
        {schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay pruebas programadas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Fecha límite</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Equipo</th>
                  <th>Sitio</th>
                  <th>Empresa</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">
                      {formatDate(schedule.dueDate)}
                    </td>

                    <td>{schedule.title}</td>

                    <td>{formatTestType(schedule.type)}</td>

                    <td>
                      {schedule.equipment.equipmentCode} —{" "}
                      {schedule.equipment.name}
                    </td>

                    <td>{schedule.equipment.site.name}</td>

                    <td>
                      {schedule.equipment.site.customerOrganization?.name ??
                        schedule.equipment.site.ownerOrganization.name}
                    </td>

                    <td>{schedule.assignedTo?.name ?? "Sin asignar"}</td>

                    <td>
                      <span className={scheduleStatusBadge(schedule.status)}>
                        {formatScheduleStatus(schedule.status)}
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
