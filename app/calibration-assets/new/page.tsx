import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssetStatus, CalibrationAssetType } from "@prisma/client";

function formatOrganizationType(value: string) {
  const labels: Record<string, string> = {
    PYROMETRY_PROVIDER: "Proveedor de pirometría",
    INTERNAL_HEAT_TREAT: "Tratamiento térmico interno",
    CUSTOMER: "Cliente externo",
  };

  return labels[value] ?? value;
}

async function createCalibrationAsset(formData: FormData) {
  "use server";

  const organizationId = String(formData.get("organizationId") || "").trim();
  const assetCode = String(formData.get("assetCode") || "").trim();
  const name = String(formData.get("name") || "").trim();

  const type = String(
    formData.get("type") || "FIELD_TEST_INSTRUMENT"
  ) as CalibrationAssetType;

  const serialNumber = String(formData.get("serialNumber") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const status = String(formData.get("status") || "ACTIVE") as AssetStatus;

  if (!organizationId) {
    throw new Error("Debes seleccionar una empresa.");
  }

  if (!assetCode) {
    throw new Error("El código del activo es obligatorio.");
  }

  if (!name) {
    throw new Error("El nombre del activo es obligatorio.");
  }

  await prisma.calibrationAsset.create({
    data: {
      organizationId,
      assetCode,
      name,
      type,
      serialNumber: serialNumber || null,
      description: description || null,
      status,
      qrCode: `CAL-ASSET-${assetCode}`,
    },
  });

  redirect("/calibration-assets");
}

export default async function NewCalibrationAssetPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuevo activo metrológico</h1>
        <p className="mt-2 text-slate-600">
          Registra cualquier activo que forme parte de la cadena de trazabilidad:
          patrón primario, patrón secundario, instrumento de campo, termopar de
          prueba o instrumentación del equipo.
        </p>
      </div>

      {organizations.length === 0 ? (
        <Card title="Primero registra una empresa">
          <p className="text-slate-600">
            Para registrar activos metrológicos necesitas tener al menos una
            empresa creada.
          </p>

          <a
            href="/organizations/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear empresa
          </a>
        </Card>
      ) : (
        <Card title="Datos del activo">
          <form action={createCalibrationAsset} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Empresa propietaria *
              </label>

              <select
                name="organizationId"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona una empresa</option>

                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name} —{" "}
                    {formatOrganizationType(organization.type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Código del activo *
                </label>

                <input
                  name="assetCode"
                  required
                  placeholder="Ej. PRIMARY-STD-001, SEC-STD-001, PIE-01"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre del activo *
                </label>

                <input
                  name="name"
                  required
                  placeholder="Ej. Field Test Instrument PIE-01"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tipo de activo *
                </label>

                <select
                  name="type"
                  defaultValue="FIELD_TEST_INSTRUMENT"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="PRIMARY_STANDARD">Patrón primario</option>
                  <option value="SECONDARY_STANDARD">Patrón secundario</option>
                  <option value="FIELD_TEST_INSTRUMENT">
                    Instrumento de prueba de campo
                  </option>
                  <option value="EQUIPMENT_INSTRUMENTATION">
                    Instrumentación del equipo
                  </option>
                  <option value="TEST_THERMOCOUPLE">
                    Termopar de prueba
                  </option>
                  <option value="REFERENCE_STANDARD">
                    Patrón de referencia
                  </option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Número de serie
                </label>

                <input
                  name="serialNumber"
                  placeholder="Ej. SN-PIE-01"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
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
                placeholder="Ej. Instrumento utilizado para SAT en campo; calibrado contra patrón secundario."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Trazabilidad metrológica
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Después de crear el activo, podrás registrar su calibración y
                vincularlo con el patrón usado. Ejemplo: PIE-01 calibrado contra
                SEC-STD-001, o SEC-STD-001 calibrado contra PRIMARY-STD-001.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar activo
              </button>

              <a
                href="/calibration-assets"
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
