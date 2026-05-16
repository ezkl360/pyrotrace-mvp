import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssetStatus } from "@prisma/client";

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "°C";
  if (value === "FAHRENHEIT") return "°F";
  return value;
}

async function createEquipmentZone(formData: FormData) {
  "use server";

  const equipmentId = String(formData.get("equipmentId") || "").trim();
  const zoneCode = String(formData.get("zoneCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const operatingMinRaw = String(formData.get("operatingMin") || "").trim();
  const operatingMaxRaw = String(formData.get("operatingMax") || "").trim();
  const nominalSetpointRaw = String(
    formData.get("nominalSetpoint") || ""
  ).trim();

  const requiresSat = formData.get("requiresSat") === "on";
  const requiresCalibration = formData.get("requiresCalibration") === "on";

  const status = String(formData.get("status") || "ACTIVE") as AssetStatus;

  if (!equipmentId) {
    throw new Error("Debes seleccionar un equipo.");
  }

  if (!zoneCode) {
    throw new Error("El código de zona es obligatorio.");
  }

  if (!name) {
    throw new Error("El nombre de la zona es obligatorio.");
  }

  if (!operatingMinRaw) {
    throw new Error("La temperatura operativa mínima es obligatoria.");
  }

  if (!operatingMaxRaw) {
    throw new Error("La temperatura operativa máxima es obligatoria.");
  }

  const operatingMin = Number(operatingMinRaw);
  const operatingMax = Number(operatingMaxRaw);

  if (Number.isNaN(operatingMin) || Number.isNaN(operatingMax)) {
    throw new Error(
      "La temperatura operativa debe usar valores numéricos válidos."
    );
  }

  if (operatingMin >= operatingMax) {
    throw new Error(
      "La temperatura operativa mínima debe ser menor que la temperatura operativa máxima."
    );
  }

  const nominalSetpoint = nominalSetpointRaw
    ? Number(nominalSetpointRaw)
    : null;

  if (nominalSetpointRaw && Number.isNaN(nominalSetpoint)) {
    throw new Error("La temperatura nominal debe ser un número válido.");
  }

  if (
    nominalSetpoint !== null &&
    (nominalSetpoint < operatingMin || nominalSetpoint > operatingMax)
  ) {
    throw new Error(
      "La temperatura nominal debe estar dentro de la temperatura operativa mínima y máxima de la zona."
    );
  }

  await prisma.equipmentZone.create({
    data: {
      equipmentId,
      zoneCode,
      name,
      description: description || null,
      operatingMin,
      operatingMax,
      nominalSetpoint,
      requiresSat,
      requiresCalibration,
      status,
    },
  });

  redirect("/equipment-zones");
}

export default async function NewEquipmentZonePage() {
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
        <h1 className="text-3xl font-bold">Nueva zona de equipo</h1>
        <p className="mt-2 text-slate-600">
          Registra zonas de calentamiento, control o calibración. Un horno puede
          tener una o varias zonas; cada zona puede tener su propia temperatura
          operativa mínima, temperatura operativa máxima, SAT y calibración.
        </p>
      </div>

      {equipment.length === 0 ? (
        <Card title="Primero registra un equipo">
          <p className="text-slate-600">
            Para crear zonas necesitas tener al menos un equipo térmico
            registrado.
          </p>

          <a
            href="/equipment/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear equipo
          </a>
        </Card>
      ) : (
        <Card title="Datos de la zona">
          <form action={createEquipmentZone} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Equipo *
              </label>

              <select
                name="equipmentId"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona un equipo</option>

                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.equipmentCode} — {item.name} / {item.site.name} /{" "}
                    {formatTemperatureUnit(item.temperatureUnit)}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                La unidad de temperatura usada en esta zona será la unidad real
                configurada en el equipo.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Código de zona *
                </label>

                <input
                  name="zoneCode"
                  required
                  placeholder="Ej. Z1, Z2, B4-Z1"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre de la zona *
                </label>

                <input
                  name="name"
                  required
                  placeholder="Ej. Heat Zone 1"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Temperatura operativa de la zona
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                La temperatura operativa mínima y máxima será usada después para
                validar SAT, calibraciones y reglas aplicables. La temperatura
                nominal es solo una referencia operativa frecuente.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Temperatura operativa mínima *
                  </label>

                  <input
                    name="operatingMin"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 800"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Temperatura operativa máxima *
                  </label>

                  <input
                    name="operatingMax"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 1050"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Temperatura nominal / frecuente
                  </label>

                  <input
                    name="nominalSetpoint"
                    type="number"
                    step="0.01"
                    placeholder="Ej. 950"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Estado
              </label>

              <select
                name="status"
                defaultValue="ACTIVE"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="ACTIVE">Activo</option>
                <option value="DUE_SOON">Próximo a vencer</option>
                <option value="OVERDUE">Vencido</option>
                <option value="BLOCKED">Bloqueado</option>
                <option value="RETIRED">Retirado</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripción
              </label>

              <textarea
                name="description"
                rows={4}
                placeholder="Ej. Primera zona de calentamiento del mesh belt furnace B4."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Requerimientos de control
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Define si esta zona requiere SAT y/o calibración propia. Esto
                permitirá programar y capturar pruebas por zona.
              </p>

              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    name="requiresSat"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Requiere SAT propio
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    name="requiresCalibration"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Requiere calibración propia
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar zona
              </button>

              <a
                href="/equipment-zones"
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
