import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function createOrganization(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "INTERNAL_HEAT_TREAT");
  const legalName = String(formData.get("legalName") || "").trim();
  const taxId = String(formData.get("taxId") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("El nombre de la empresa es obligatorio.");
  }

  await prisma.organization.create({
    data: {
      name,
      type: type as
        | "PYROMETRY_PROVIDER"
        | "INTERNAL_HEAT_TREAT"
        | "CUSTOMER",
      legalName: legalName || null,
      taxId: taxId || null,
      notes: notes || null,
    },
  });

  redirect("/organizations");
}

export default function NewOrganizationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            PyroTrace AI
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            Nueva empresa
          </h1>

          <p className="mt-3 text-slate-300">
            Registra una empresa proveedora de pirometría, una empresa interna
            de tratamiento térmico o un cliente externo.
          </p>
        </div>

        <form
          action={createOrganization}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Nombre comercial *
              </label>
              <input
                name="name"
                required
                placeholder="Ej. PyroTrace Services"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Tipo de empresa *
              </label>
              <select
                name="type"
                defaultValue="INTERNAL_HEAT_TREAT"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="PYROMETRY_PROVIDER">
                  Proveedor de pirometría
                </option>
                <option value="INTERNAL_HEAT_TREAT">
                  Tratamiento térmico interno
                </option>
                <option value="CUSTOMER">Cliente externo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Razón social
              </label>
              <input
                name="legalName"
                placeholder="Ej. PyroTrace Services LLC"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                RFC / Tax ID
              </label>
              <input
                name="taxId"
                placeholder="Ej. RFC123456789"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Notas
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Notas internas sobre la empresa, alcance del servicio o contexto del cliente."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300"
            >
              Guardar empresa
            </button>

            <a
              href="/organizations"
              className="rounded-2xl border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Cancelar
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

