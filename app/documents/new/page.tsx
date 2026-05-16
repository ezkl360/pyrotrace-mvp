import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DocumentCategory } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

async function createDocument(formData: FormData) {
  "use server";

  const organizationId = String(formData.get("organizationId") || "").trim();
  const equipmentIdRaw = String(formData.get("equipmentId") || "").trim();

  const category = String(
    formData.get("category") || "OTHER"
  ) as DocumentCategory;

  const title = String(formData.get("title") || "").trim();

  const uploadedFile = formData.get("file");

  if (!organizationId) {
    throw new Error("Debes seleccionar una empresa.");
  }

  if (!title) {
    throw new Error("El título del documento es obligatorio.");
  }

  if (!(uploadedFile instanceof File)) {
    throw new Error("Debes seleccionar un archivo PDF.");
  }

  if (uploadedFile.size === 0) {
    throw new Error("El archivo está vacío o no se seleccionó correctamente.");
  }

  if (uploadedFile.type !== "application/pdf") {
    throw new Error("Por ahora solo se permiten archivos PDF.");
  }

  const timestamp = Date.now();

  const safeFileName = uploadedFile.name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9._-]/g, "");

  const finalFileName = `${timestamp}-${safeFileName}`;

  const relativeStoragePath = `uploads/reports/${finalFileName}`;

  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "reports",
    finalFileName
  );

  const bytes = await uploadedFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(absolutePath, buffer);

  await prisma.document.create({
    data: {
      organizationId,
      equipmentId: equipmentIdRaw || null,
      category,
      title,
      fileName: uploadedFile.name,
      storageBucket: "local-public",
      storagePath: relativeStoragePath,
      mimeType: uploadedFile.type,
      sizeBytes: uploadedFile.size,
      version: 1,
    },
  });

  redirect("/documents");
}

export default async function NewDocumentPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });

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
        <h1 className="text-3xl font-bold">Nuevo documento</h1>
        <p className="mt-2 text-slate-600">
          Sube reportes PDF de SAT, TUS, calibración, certificados, evidencia
          documental o paquetes de auditoría. El sistema guardará automáticamente
          el archivo y sus metadatos.
        </p>
      </div>

      {organizations.length === 0 ? (
        <Card title="Primero registra una empresa">
          <p className="text-slate-600">
            Para registrar documentos necesitas tener al menos una empresa
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
        <Card title="Datos del documento">
          <form action={createDocument} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Empresa *
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Equipo relacionado
                </label>

                <select
                  name="equipmentId"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">No aplica</option>

                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.equipmentCode} — {item.name} / {item.site.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Categoría *
                </label>

                <select
                  name="category"
                  defaultValue="CALIBRATION_REPORT"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="SAT_REPORT">Reporte SAT</option>
                  <option value="TUS_REPORT">Reporte TUS</option>
                  <option value="CALIBRATION_REPORT">
                    Reporte de calibración
                  </option>
                  <option value="CERTIFICATE">Certificado</option>
                  <option value="PHOTO_EVIDENCE">Evidencia fotográfica</option>
                  <option value="PROCEDURE">Procedimiento</option>
                  <option value="AUDIT_PACKAGE">Paquete de auditoría</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Título del documento *
                </label>

                <input
                  name="title"
                  required
                  placeholder="Ej. Reporte de calibración horno FURNACE-002"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Archivo PDF
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Selecciona el reporte, certificado o evidencia en formato PDF.
                El sistema guardará el archivo y registrará automáticamente su
                nombre, tamaño, tipo y ruta.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subir PDF *
                </label>

                <input
                  name="file"
                  type="file"
                  accept="application/pdf"
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600"
              >
                Guardar documento
              </button>

              <a
                href="/documents"
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
