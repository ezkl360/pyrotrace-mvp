import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "°C";
  if (value === "FAHRENHEIT") return "°F";
  return value;
}

async function createSatRecord(formData: FormData) {
  "use server";

  const equipmentId = String(formData.get("equipmentId") || "").trim();
  const performedAtRaw = String(formData.get("performedAt") || "").trim();
  const setpointRaw = String(formData.get("setpoint") || "").trim();
  const systemReadingRaw = String(formData.get("systemReading") || "").trim();
  const referenceReadingRaw = String(
    formData.get("referenceReading") || ""
  ).trim();
  const correctionFactorRaw = String(
    formData.get("correctionFactor") || "0"
  ).trim();
  const technicianNotes = String(
    formData.get("technicianNotes") || ""
  ).trim();

  if (!equipmentId) {
    throw new Error("Debes seleccionar un equipo.");
  }

  if (!performedAtRaw) {
    throw new Error("La fecha de ejecución es obligatoria.");
  }

  if (!setpointRaw || !systemReadingRaw || !referenceReadingRaw) {
    throw new Error("Debes capturar setpoint, lectura del sistema y lectura del patrón.");
  }

  const equipment = await prisma.equipment.findUnique({
    where: {
      id: equipmentId,
    },
  });

  if (!equipment) {
    throw new Error("No se encontró el equipo seleccionado.");
  }

  const complianceRule = await prisma.complianceRule.findFirst({
    where: {
      active: true,
      applicableStandard: equipment.applicableStandard,
      testType: "SAT",
      temperatureUnit: equipment.temperatureUnit,
      amsFurnaceClass: equipment.amsFurnaceClass,
      amsInstrumentationType: equipment.amsInstrumentationType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!complianceRule) {
    throw new Error(
      "No existe una regla de cumplimiento SAT activa para la norma, unidad, clase e instrumentación de este equipo. Configura primero la regla en Compliance Rules."
    );
  }

  const setpoint = Number(setpointRaw);
  const systemReading = Number(systemReadingRaw);
  const referenceReading = Number(referenceReadingRaw);
  const correctionFactor = Number(correctionFactorRaw || "0");

  if (
    Number.isNaN(setpoint) ||
    Number.isNaN(systemReading) ||
    Number.isNaN(referenceReading) ||
    Number.isNaN(correctionFactor)
  ) {
    throw new Error("Las lecturas deben ser valores numéricos válidos.");
  }

  const correctedReferenceReading = referenceReading + correctionFactor;
  const error = systemReading - correctedReferenceReading;
  const absoluteError = Math.abs(error);
  const pass = absoluteError <= complianceRule.toleranceLimit;
  const result = pass ? "PASS" : "FAIL";

  await prisma.pyrometryRecord.create({
    data: {
      equipmentId,
      complianceRuleId: complianceRule.id,
      type: "SAT",
      status: "SUBMITTED",
      performedAt: new Date(performedAtRaw),
      result,
      tolerance: complianceRule.toleranceLimit,
      maxError: absoluteError,
      technicianNotes: technicianNotes || null,
      satRecord: {
        create: {
          setpoint,
          systemReading,
          referenceReading,
          correctionFactor,
          correctedReferenceReading,
          error,
          absoluteError,
          pass,
        },
      },
    },
  });

  redirect("/sat-records");
}

export default async function NewSatRecordPage() {
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
        <h1 className="text-3xl font-bold">Nuevo SAT</h1>
        <p className="mt-2 text-slate-600">
          Captura un System Accuracy Test. El sistema buscará automáticamente la
          regla aplicable según equipo, norma, unidad, clase AMS e
          instrumentación.
        </p>
      </div>

      {equipment.length === 0 ? (
        <Card title="Primero registra un equipo">
          <p className="text-slate-600">
            Para capturar un SAT necesitas tener al menos un equipo térmico
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
        <Card title="Datos del SAT">
          <form action={createSatRecord} className="space-y-6">
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
                    {formatTemperatureUnit(item.temperatureUnit)} /{" "}
                    {formatStandard(item.applicableStandard)} /{" "}
                    {formatAmsClass(item.amsFurnaceClass)} /{" "}
                    {formatInstrumentation(item.amsInstrumentationType)}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Debe existir una regla SAT activa que coincida con este equipo.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha de ejecución *
                </label>

                <input
                  name="performedAt"
                  type="date"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Setpoint *
                </label>

                <input
                  name="setpoint"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 950"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lectura del sistema *
                </label>

                <input
                  name="systemReading"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 951"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lectura del patrón *
                </label>

                <input
                  name="referenceReading"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 949"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Factor de corrección del patrón
              </label>

              <input
                name="correctionFactor"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="Ej. -0.5"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                El sistema calculará: lectura patrón corregida = lectura patrón
                + factor de corrección.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Cálculo automático
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Al guardar, PyroTrace buscará la regla SAT aplicable. Después
                calculará el error y determinará PASS / FAIL automáticamente.
                El operador no captura la tolerancia.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notas del técnico
              </label>

              <textarea
                name="technicianNotes"
                rows={4}
                placeholder="Ej. SAT realizado sin ajuste. Lecturas estables."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar SAT
              </button>

              <a
                href="/sat-records"
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
