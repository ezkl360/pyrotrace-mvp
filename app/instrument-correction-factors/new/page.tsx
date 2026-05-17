import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TemperatureUnit } from "@prisma/client";

async function createInstrumentCorrectionFactor(formData: FormData) {
  "use server";

  const instrumentId = String(formData.get("instrumentId") || "").trim();

  const nominalTemperatureRaw = String(
    formData.get("nominalTemperature") || ""
  ).trim();

  const correctionFactorRaw = String(
    formData.get("correctionFactor") || ""
  ).trim();

  const temperatureUnit = String(
    formData.get("temperatureUnit") || "CELSIUS"
  ) as TemperatureUnit;

  const uncertaintyRaw = String(formData.get("uncertainty") || "").trim();

  const certificateNumber = String(
    formData.get("certificateNumber") || ""
  ).trim();

  const notes = String(formData.get("notes") || "").trim();

  if (!instrumentId) {
    throw new Error("Debes seleccionar un instrumento.");
  }

  if (!nominalTemperatureRaw) {
    throw new Error("La temperatura nominal es obligatoria.");
  }

  if (!correctionFactorRaw) {
    throw new Error("El factor de corrección es obligatorio.");
  }

  const nominalTemperature = Number(nominalTemperatureRaw);
  const correctionFactor = Number(correctionFactorRaw);
  const uncertainty = uncertaintyRaw ? Number(uncertaintyRaw) : null;

  if (Number.isNaN(nominalTemperature)) {
    throw new Error("La temperatura nominal debe ser un número válido.");
  }

  if (Number.isNaN(correctionFactor)) {
    throw new Error("El factor de corrección debe ser un número válido.");
  }

  if (uncertaintyRaw && Number.isNaN(uncertainty)) {
    throw new Error("La incertidumbre debe ser un número válido.");
  }

  await prisma.instrumentCorrectionFactor.create({
    data: {
      instrumentId,
      nominalTemperature,
      correctionFactor,
      temperatureUnit,
      uncertainty,
      certificateNumber: certificateNumber || null,
      notes: notes || null,
      active: true,
    },
  });

  redirect("/instrument-correction-factors");
}

export default async function NewInstrumentCorrectionFactorPage() {
  const instruments = await prisma.instrument.findMany({
    include: {
      organization: true,
    },
    orderBy: {
      instrumentCode: "asc",
    },
  });

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Nuevo factor de corrección de instrumento
        </h1>
        <p className="mt-2 text-slate-600">
          Captura factores de corrección por temperatura para instrumentos de
          campo. Estos valores deben provenir del certificado de calibración o
          fuente aprobada.
        </p>
      </div>

      {instruments.length === 0 ? (
        <Card title="Primero registra un instrumento">
          <p className="text-slate-600">
            Para capturar factores de corrección necesitas tener al menos un
            instrumento registrado.
          </p>

          <a
            href="/instruments/new"
            className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Crear instrumento
          </a>
        </Card>
      ) : (
        <Card title="Datos del factor de corrección">
          <form action={createInstrumentCorrectionFactor} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Instrumento *
              </label>

              <select
                name="instrumentId"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Selecciona un instrumento</option>

                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.instrumentCode} — {instrument.name} /{" "}
                    {instrument.organization.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Temperatura nominal *
                </label>

                <input
                  name="nominalTemperature"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 950"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Punto de temperatura del certificado.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Factor de corrección *
                </label>

                <input
                  name="correctionFactor"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 0.8 o -0.4"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Puede ser positivo o negativo.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Unidad *
                </label>

                <select
                  name="temperatureUnit"
                  defaultValue="FAHRENHEIT"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="CELSIUS">Celsius °C</option>
                  <option value="FAHRENHEIT">Fahrenheit °F</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Incertidumbre
                </label>

                <input
                  name="uncertainty"
                  type="number"
                  step="0.01"
                  placeholder="Ej. 0.3"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Opcional. Usa la misma unidad de temperatura.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Número de certificado
                </label>

                <input
                  name="certificateNumber"
                  placeholder="Ej. CAL-PIE-01-2026"
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
                placeholder="Ej. Factor tomado del certificado de calibración vigente."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Uso en SAT
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Durante un SAT, PyroTrace seleccionará el factor del instrumento
                que coincida con la temperatura de prueba. Después lo aplicará
                automáticamente al cálculo de lectura corregida.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar factor
              </button>

              <a
                href="/instrument-correction-factors"
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
