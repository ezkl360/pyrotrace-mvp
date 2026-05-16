import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  ApplicableStandard,
  AmsFurnaceClass,
  AmsInstrumentationType,
  TemperatureUnit,
  TestType,
} from "@prisma/client";

async function createComplianceRule(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();

  const applicableStandard = String(
    formData.get("applicableStandard") || "AMS2750"
  ) as ApplicableStandard;

  const testType = String(formData.get("testType") || "SAT") as TestType;

  const temperatureUnit = String(
    formData.get("temperatureUnit") || "CELSIUS"
  ) as TemperatureUnit;

  const amsFurnaceClass = String(
    formData.get("amsFurnaceClass") || "NOT_APPLICABLE"
  ) as AmsFurnaceClass;

  const amsInstrumentationType = String(
    formData.get("amsInstrumentationType") || "NOT_APPLICABLE"
  ) as AmsInstrumentationType;

  const toleranceLimitRaw = String(
    formData.get("toleranceLimit") || ""
  ).trim();

  const toleranceLabel = String(
    formData.get("toleranceLabel") || ""
  ).trim();

  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("El nombre de la regla es obligatorio.");
  }

  if (!toleranceLimitRaw) {
    throw new Error("La tolerancia límite es obligatoria.");
  }

  const toleranceLimit = Number(toleranceLimitRaw);

  if (Number.isNaN(toleranceLimit) || toleranceLimit < 0) {
    throw new Error("La tolerancia debe ser un número válido mayor o igual a 0.");
  }

  await prisma.complianceRule.create({
    data: {
      name,
      applicableStandard,
      testType,
      temperatureUnit,
      amsFurnaceClass,
      amsInstrumentationType,
      toleranceLimit,
      toleranceLabel: toleranceLabel || null,
      notes: notes || null,
      active: true,
    },
  });

  redirect("/compliance-rules");
}

export default function NewComplianceRulePage() {
  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nueva regla de cumplimiento</h1>
        <p className="mt-2 text-slate-600">
          Configura una tolerancia aprobada para una combinación específica de
          norma, tipo de prueba, unidad, clase AMS e instrumentación. Estas
          reglas serán usadas por SAT, TUS y calibraciones para calcular
          PASS / FAIL.
        </p>
      </div>

      <Card title="Datos de la regla">
        <form action={createComplianceRule} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nombre de la regla *
            </label>

            <input
              name="name"
              required
              placeholder="Ej. AMS2750 SAT Clase 2 Tipo B ±10 °F"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Usa un nombre claro para que el responsable técnico pueda auditar
              de dónde viene la tolerancia.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
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
                Tipo de prueba *
              </label>

              <select
                name="testType"
                defaultValue="SAT"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="SAT">SAT</option>
                <option value="TUS">TUS</option>
                <option value="CALIBRATION">Calibración</option>
                <option value="THERMOCOUPLE_USAGE">Uso de termopar</option>
                <option value="MAINTENANCE_CHECK">
                  Revisión de mantenimiento
                </option>
                <option value="ALARM_TEST">Prueba de alarma</option>
                <option value="OTHER_TEST">Otra prueba</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Unidad de temperatura *
              </label>

              <select
                name="temperatureUnit"
                defaultValue="CELSIUS"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="CELSIUS">Celsius °C</option>
                <option value="FAHRENHEIT">Fahrenheit °F</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Condiciones AMS
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Para AMS2750, selecciona la clase del horno y tipo de
              instrumentación. Para CQI-9, CQI-11, CQI-12 u otros requisitos
              donde no aplique esta clasificación, deja “No aplica”.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Clase AMS
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
                  Tipo de instrumentación AMS
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
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tolerancia límite *
              </label>

              <input
                name="toleranceLimit"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Ej. 10"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Este valor será usado por el sistema para calcular PASS / FAIL.
                No será capturado por el operador durante la prueba.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Etiqueta de tolerancia
              </label>

              <input
                name="toleranceLabel"
                placeholder="Ej. ±10 °F"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Texto visible en pantalla y reportes. Si lo dejas vacío, el
                sistema generará una etiqueta automática.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notas internas
            </label>

            <textarea
              name="notes"
              rows={4}
              placeholder="Ej. Regla configurada por responsable técnico conforme al perfil interno aprobado."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
            >
              Guardar regla
            </button>

            <a
              href="/compliance-rules"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </a>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
