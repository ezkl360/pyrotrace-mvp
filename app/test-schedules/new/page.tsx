import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ScheduleStatus, TestType } from "@prisma/client";

async function createTestSchedule(formData: FormData) {
  "use server";

  const equipmentId = String(formData.get("equipmentId") || "").trim();
  const type = String(formData.get("type") || "SAT") as TestType;
  const title = String(formData.get("title") || "").trim();
  const plannedStartRaw = String(formData.get("plannedStart") || "").trim();
  const plannedEndRaw = String(formData.get("plannedEnd") || "").trim();
  const dueDateRaw = String(formData.get("dueDate") || "").trim();
  const status = String(formData.get("status") || "PLANNED") as ScheduleStatus;
  const notes = String(formData.get("notes") || "").trim();

  if (!equipmentId) {
    throw new Error("Debes seleccionar un equipo térmico.");
  }

  if (!title) {
    throw new Error("El título de la programación es obligatorio.");
  }

  if (!plannedStartRaw) {
    throw new Error("La fecha programada de inicio es obligatoria.");
  }

  if (!dueDateRaw) {
    throw new Error("La fecha límite es obligatoria.");
  }

  await prisma.testSchedule.create({
    data: {
      equipmentId,
      type,
      title,
      plannedStart: new Date(plannedStartRaw),
      plannedEnd: plannedEndRaw ? new Date(plannedEndRaw) : null,
      dueDate: new Date(dueDateRaw),
      status,
      notes: notes || null,
    },
  });

  redirect("/test-schedules");
}

export default async function NewTestSchedulePage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nueva programación de prueba</h1>
        <p className="mt-2 text-slate-600">
          Programa una prueba SAT, TUS, calibración, revisión de mantenimiento o
          control relacionado con termopares.
        </p>
      </div>

      {equipment.length === 0 ? (
        <Card title="Primero registra un equipo térmico">
          <p className="text-slate-600">
            Para programar pruebas necesitas tener al menos un equipo térmico
            registrado.
          </p>

          <a
            href="/equipment/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear equipo térmico
          </a>
        </Card>
      ) : (
        <Card title="Datos de la programación">
          <form action={createTestSchedule} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Equipo térmico *
              </label>

              <select
                name="equipmentId"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona un equipo</option>

                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.equipmentCode} — {item.name} / {item.site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tipo de prueba *
                </label>

                <select
                  name="type"
                  defaultValue="SAT"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="SAT">SAT</option>
                  <option value="TUS">TUS</option>
                  <option value="CALIBRATION">Calibración</option>
                  <option value="THERMOCOUPLE_USAGE">
                    Uso de termopar
                  </option>
                  <option value="MAINTENANCE_CHECK">
                    Revisión de mantenimiento
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Estado *
                </label>

                <select
                  name="status"
                  defaultValue="PLANNED"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="PLANNED">Planeada</option>
                  <option value="DUE_SOON">Próxima a vencer</option>
                  <option value="IN_PROGRESS">En proceso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="OVERDUE">Vencida</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título *
              </label>

              <input
                name="title"
                required
                placeholder="Ej. SAT trimestral horno FURNACE-002"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha programada de inicio *
                </label>

                <input
                  name="plannedStart"
                  type="date"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha programada de fin
                </label>

                <input
                  name="plannedEnd"
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha límite *
                </label>

                <input
                  name="dueDate"
                  type="date"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notas
              </label>

              <textarea
                name="notes"
                rows={4}
                placeholder="Ej. Programar con técnico asignado, revisar patrón vigente, confirmar disponibilidad del horno."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar programación
              </button>

              <a
                href="/test-schedules"
                className="rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </a>
            </div>
          </form>
        </Card>
      )}
    </Shell>
  );
}
