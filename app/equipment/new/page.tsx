import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  ApplicableStandard,
  AmsFurnaceClass,
  AmsInstrumentationType,
} from "@prisma/client";

async function createEquipment(formData: FormData) {
  "use server";

  const siteId = String(formData.get("siteId") || "").trim();
  const equipmentCode = String(formData.get("equipmentCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const process = String(formData.get("process") || "").trim();

  const applicableStandard = String(
    formData.get("applicableStandard") || "AMS2750"
  ) as ApplicableStandard;

  const amsFurnaceClass = String(
    formData.get("amsFurnaceClass") || "NOT_APPLICABLE"
  ) as AmsFurnaceClass;

  const amsInstrumentationType = String(
    formData.get("amsInstrumentationType") || "NOT_APPLICABLE"
  ) as AmsInstrumentationType;

  const customerSpecificRequirement = String(
    formData.get("customerSpecificRequirement") || ""
  ).trim();

  const operatingRange = String(formData.get("operatingRange") || "").trim();

  const satFrequencyDaysRaw = String(
    formData.get("satFrequencyDays") || ""
  ).trim();

  const tusFrequencyDaysRaw = String(
    formData.get("tusFrequencyDays") || ""
  ).trim();

  const calibrationFrequencyDaysRaw = String(
    formData.get("calibrationFrequencyDays") || ""
  ).trim();

  if (!siteId) {
    throw new Error("Debes seleccionar un sitio.");
  }

  if (!equipmentCode) {
    throw new Error("El código del equipo es obligatorio.");
  }

  if (!name) {
    throw new Error("El nombre del equipo es obligatorio.");
  }

  await prisma.equipment.create({
    data: {
      siteId,
      equipmentCode,
      name,
      process: process || null,
      applicableStandard,
      amsFurnaceClass,
      amsInstrumentationType,
      customerSpecificRequirement: customerSpecificRequirement || null,
      operatingRange: operatingRange || null,
      satFrequencyDays: satFrequencyDaysRaw
        ? Number(satFrequencyDaysRaw)
        : null,
      tusFrequencyDays: tusFrequencyDaysRaw
        ? Number(tusFrequencyDaysRaw)
        : null,
      calibrationFrequencyDays: calibrationFrequencyDaysRaw
        ? Number(calibrationFrequencyDaysRaw)
        : null,
      qrCode: `EQ-${equipmentCode}`,
    },
  });

  redirect("/equipment");
}

export default async function NewEquipmentPage() {
  const sites = await prisma.site.findMany({
    include: {
      ownerOrganization: true,
      customerOrganization: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuevo equipo térmico</h1>
        <p className="mt-2 text-slate-600">
          Registra hornos, cámaras, equipos térmicos o activos críticos sujetos
          a SAT, TUS, calibración o control pirométrico.
        </p>
      </div>

      {sites.length === 0 ? (
        <Card title="Primero registra un sitio">
          <p className="text-slate-600">
            Para crear un equipo térmico necesitas tener al menos un sitio o
            planta registrada.
          </p>

          <a
            href="/sites/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear sitio
          </a>
        </Card>
      ) : (
        <Card title="Datos del equipo">
          <form action={createEquipment} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sitio / planta *
              </label>

              <select
                name="siteId"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona un sitio</option>

                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} — {site.ownerOrganization.name}
                    {site.customerOrganization
                      ? ` / Cliente: ${site.customerOrganization.name}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Código del equipo *
                </label>

                <input
                  name="equipmentCode"
                  required
                  placeholder="Ej. FURNACE-001"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre del equipo *
                </label>

                <input
                  name="name"
                  required
                  placeholder="Ej. Horno de revenido 1"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Proceso
                </label>

                <input
                  name="process"
                  placeholder="Ej. Tratamiento térmico / Revenido / Temple"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rango operativo
                </label>

                <input
                  name="operatingRange"
                  placeholder="Ej. 150 °C - 650 °C"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Norma aplicable
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Selecciona la norma o requerimiento que aplica al equipo. Para
                AMS2750 se debe capturar clase del horno y tipo de
                instrumentación. Para CQI-9, CQI-11 o CQI-12 esos campos pueden
                quedar como “No aplica”.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Norma aplicable *
                  </label>

                  <select
                    name="applicableStandard"
                    defaultValue="AMS2750"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="AMS2750">AMS2750</option>
                    <option value="AMS2770">AMS2770</option>
                    <option value="CQI_9">CQI-9</option>
                    <option value="CQI_11">CQI-11</option>
                    <option value="CQI_12">CQI-12</option>
                    <option value="CUSTOMER_SPECIFIC">
                      Requisito específico de cliente
                    </option>
                    <option value="OTHER">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Clase AMS2750
                  </label>

                  <select
                    name="amsFurnaceClass"
                    defaultValue="NOT_APPLICABLE"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="NOT_APPLICABLE">No aplica</option>
                    <option value="CLASS_1">Clase 1</option>
                    <option value="CLASS_2">Clase 2</option>
                    <option value="CLASS_3">Clase 3</option>
                    <option value="CLASS_4">Clase 4</option>
                    <option value="CLASS_5">Clase 5</option>
                    <option value="CLASS_6">Clase 6</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tipo de instrumentación AMS2750
                  </label>

                  <select
                    name="amsInstrumentationType"
                    defaultValue="NOT_APPLICABLE"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  >
                    <option value="NOT_APPLICABLE">No aplica</option>
                    <option value="TYPE_A">Tipo A</option>
                    <option value="TYPE_B">Tipo B</option>
                    <option value="TYPE_C">Tipo C</option>
                    <option value="TYPE_D">Tipo D</option>
                    <option value="TYPE_E">Tipo E</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Requisito específico del cliente
                </label>

                <textarea
                  name="customerSpecificRequirement"
                  rows={3}
                  placeholder="Ej. Requisito interno del cliente, estándar corporativo o nota especial de auditoría."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Frecuencia SAT días
                </label>

                <input
                  name="satFrequencyDays"
                  type="number"
                  min="1"
                  placeholder="Ej. 90"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Frecuencia TUS días
                </label>

                <input
                  name="tusFrequencyDays"
                  type="number"
                  min="1"
                  placeholder="Ej. 180"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Frecuencia calibración días
                </label>

                <input
                  name="calibrationFrequencyDays"
                  type="number"
                  min="1"
                  placeholder="Ej. 365"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar equipo
              </button>

              <a
                href="/equipment"
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
