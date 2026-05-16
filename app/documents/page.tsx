import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";

function formatCategory(value: string) {
  const labels: Record<string, string> = {
    SAT_REPORT: "Reporte SAT",
    TUS_REPORT: "Reporte TUS",
    CALIBRATION_REPORT: "Reporte de calibración",
    CERTIFICATE: "Certificado",
    PHOTO_EVIDENCE: "Evidencia fotográfica",
    PROCEDURE: "Procedimiento",
    AUDIT_PACKAGE: "Paquete de auditoría",
    OTHER: "Otro",
  };

  return labels[value] ?? value;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      organization: true,
      equipment: {
        include: {
          site: true,
        },
      },
      record: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Shell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes / Storage</h1>
          <p className="mt-2 text-slate-600">
            Registro documental de reportes SAT, TUS, calibraciones,
            certificados, evidencia fotográfica y paquetes de auditoría.
          </p>
        </div>

        <a
          href="/documents/new"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
        >
          Nuevo documento
        </a>
      </div>

      <Card title="Documentos registrados">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No hay documentos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Fecha</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Empresa</th>
                  <th>Equipo</th>
                  <th>Archivo</th>
                  <th>Tamaño</th>
                  <th>Versión</th>
                  <th>Ver</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr key={document.id} className="border-b last:border-0">
                    <td className="py-3">{formatDate(document.createdAt)}</td>

                    <td className="font-medium">{document.title}</td>

                    <td>{formatCategory(document.category)}</td>

                    <td>{document.organization.name}</td>

                    <td>
                      {document.equipment
                        ? `${document.equipment.equipmentCode} — ${document.equipment.name}`
                        : "—"}
                    </td>

                    <td className="font-mono text-xs">{document.fileName}</td>

                    <td>{formatBytes(document.sizeBytes)}</td>

                    <td>v{document.version}</td>

                    <td>
                      <a
                        href={`/${document.storagePath}`}
                        target="_blank"
                        className="font-semibold text-cyan-600 hover:text-cyan-700"
                      >
                        Abrir PDF
                      </a>
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
