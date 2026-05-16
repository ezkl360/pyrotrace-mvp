import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";

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

function formatTestType(value: string) {
  const labels: Record<string, string> = {
    SAT: "SAT",
    TUS: "TUS",
    CALIBRATION: "Calibración",
    THERMOCOUPLE_USAGE: "Uso de termopar",
    MAINTENANCE_CHECK: "Revisión de mantenimiento",
    ALARM_TEST: "Prueba de alarma",
    OTHER_TEST: "Otra prueba",
  };

  return labels[value] ?? value;
}

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "Celsius °C";
  if (value === "FAHRENHEIT") return "Fahrenheit °F";
  return value;
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

export default async function ComplianceRulesPage() {
  const rules = await prisma.complianceRule.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Reglas de cumplimiento</h1>
          <p className="mt-2 text-slate-600">
            Configura las tolerancias controladas por norma, tipo de prueba,
            unidad de temperatura, clase AMS e instrumentación. Estas reglas
            serán usadas para calcular PASS / FAIL sin que el operador capture
            tolerancias manualmente.
          </p>
        </div>

        <a
          href="/compliance-rules/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nueva regla
        </a>
      </div>

      <Card title="Reglas configuradas">
        {rules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay reglas de cumplimiento configuradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Nombre</th>
                  <th>Norma</th>
                  <th>Prueba</th>
                  <th>Unidad</th>
                  <th>Clase AMS</th>
                  <th>Instrumentación</th>
                  <th>Tolerancia</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{rule.name}</td>
                    <td>{formatStandard(rule.applicableStandard)}</td>
                    <td>{formatTestType(rule.testType)}</td>
                    <td>{formatTemperatureUnit(rule.temperatureUnit)}</td>
                    <td>{formatAmsClass(rule.amsFurnaceClass)}</td>
                    <td>{formatInstrumentation(rule.amsInstrumentationType)}</td>
                    <td>
                      {rule.toleranceLabel ??
                        `±${rule.toleranceLimit} ${
                          rule.temperatureUnit === "CELSIUS" ? "°C" : "°F"
                        }`}
                    </td>
                    <td>
                      <span
                        className={
                          rule.active
                            ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {rule.active ? "Activa" : "Inactiva"}
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
