import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssetStatus } from "@prisma/client";

async function createInstrument(formData: FormData) {
  "use server";

  const organizationId = String(formData.get("organizationId") || "").trim();
  const instrumentCode = String(formData.get("instrumentCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const serialNumber = String(formData.get("serialNumber") || "").trim();
  const calibrationDueRaw = String(formData.get("calibrationDue") || "").trim();
  const status = String(formData.get("status") || "ACTIVE") as AssetStatus;

  if (!organizationId) {
    throw new Error("Debes seleccionar una empresa.");
  }

  if (!instrumentCode) {
    throw new Error("El código del instrumento es obligatorio.");
  }

  if (!name) {
    throw new Error("El nombre del instrumento es obligatorio.");
  }

  if (!type) {
    throw new Error("El tipo de instrumento es obligatorio.");
  }

  await prisma.instrument.create({
    data: {
      organizationId,
      instrumentCode,
      name,
      type,
      serialNumber: serialNumber || null,
      calibrationDue: calibrationDueRaw ? new Date(calibrationDueRaw) : null,
      status,
      qrCode: `INST-${instrumentCode}`,
    },
  });

  redirect("/instruments");
}

export default async function NewInstrumentPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuevo instrumento</h1>
        <p className="mt-2 text-slate-600">
          Registra instrumentos de campo como PIE-01, data logger, calibrador,
          lector portátil o instrumento patrón usado en SAT y calibraciones.
        </p>
      </div>

      {organizations.length === 0 ? (
        <Card title="Primero registra una empresa">
          <p className="text-slate-600">
            Para registrar instrumentos necesitas tener al menos una empresa
            creada.
          </p>

          <a
            href="/organizations/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear empresa
          </a>
        </Card>
      ) : (
        <Card title="Datos del instrumento">
          <form action={createInstrument} className="space-y-6">
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
                    {organization.name} — {organization.type}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Puede ser una empresa con pirometría interna o un proveedor de
                servicios de pirometría.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Código del instrumento *
                </label>

                <input
                  name="instrumentCode"
                  required
                  placeholder="Ej. PIE-01"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre del instrumento *
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
                  Tipo de instrumento *
                </label>

                <select
                  name="type"
                  required
                  defaultValue="Field Test Instrument"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="Field Test Instrument">
                    Field Test Instrument
                  </option>
                  <option value="Data Logger">Data Logger</option>
                  <option value="Calibrator">Calibrator</option>
                  <option value="Reference Instrument">
                    Reference Instrument
                  </option>
                  <option value="Recorder">Recorder</option>
                  <option value="Controller">Controller</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Número de serie
                </label>

                <input
                  name="serialNumber"
                  placeholder="Ej. SN-12345"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha de vencimiento de calibración
                </label>

                <input
                  name="calibrationDue"
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
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
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Factores de corrección
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Después de guardar el instrumento, podrás capturar sus factores
                de corrección por temperatura. Durante el SAT, PyroTrace
                seleccionará el factor aplicable para el cálculo automático.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar instrumento
              </button>

              <a
                href="/instruments"
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
