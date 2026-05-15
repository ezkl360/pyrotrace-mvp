import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function createSite(formData: FormData) {
  "use server";

  const ownerOrganizationId = String(
    formData.get("ownerOrganizationId") || ""
  ).trim();

  const customerOrganizationIdRaw = String(
    formData.get("customerOrganizationId") || ""
  ).trim();

  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const country = String(formData.get("country") || "").trim();

  if (!ownerOrganizationId) {
    throw new Error("Debes seleccionar una empresa operadora.");
  }

  if (!name) {
    throw new Error("El nombre del sitio es obligatorio.");
  }

  if (!code) {
    throw new Error("El código del sitio es obligatorio.");
  }

  await prisma.site.create({
    data: {
      ownerOrganizationId,
      customerOrganizationId: customerOrganizationIdRaw || null,
      name,
      code,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || null,
    },
  });

  redirect("/sites");
}

export default async function NewSitePage() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            PyroTrace AI
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            Nuevo sitio
          </h1>

          <p className="mt-3 text-slate-300">
            Registra una planta, ubicación o sitio donde se encuentren equipos
            térmicos. El sitio debe pertenecer a una empresa operadora y puede
            asociarse también a un cliente externo.
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
            <h2 className="text-lg font-semibold">Primero crea una empresa</h2>
            <p className="mt-2 text-sm leading-6">
              Para registrar un sitio necesitas tener al menos una empresa
              creada. Ve al módulo de empresas y registra una empresa operadora
              o cliente.
            </p>

            <a
              href="/organizations/new"
              className="mt-5 inline-flex rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
            >
              Crear empresa
            </a>
          </div>
        ) : (
          <form
            action={createSite}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Empresa operadora *
                </label>

                <select
                  name="ownerOrganizationId"
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                >
                  <option value="">Selecciona una empresa</option>

                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name} — {organization.type}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-400">
                  Es la empresa que opera el sistema o el proveedor que administra
                  el servicio.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Empresa cliente
                </label>

                <select
                  name="customerOrganizationId"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                >
                  <option value="">No aplica / mismo dueño</option>

                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name} — {organization.type}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-400">
                  Úsalo cuando una empresa proveedora de pirometría atiende a una
                  planta de otra empresa.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Nombre del sitio *
                </label>

                <input
                  name="name"
                  required
                  placeholder="Ej. Planta Tratamiento Térmico Querétaro"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Código del sitio *
                </label>

                <input
                  name="code"
                  required
                  placeholder="Ej. QRO-HT-01"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Dirección
                </label>

                <input
                  name="address"
                  placeholder="Ej. Parque industrial, nave 4"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Ciudad
                  </label>

                  <input
                    name="city"
                    placeholder="Ej. Querétaro"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Estado
                  </label>

                  <input
                    name="state"
                    placeholder="Ej. Querétaro"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    País
                  </label>

                  <input
                    name="country"
                    placeholder="Ej. México"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300"
              >
                Guardar sitio
              </button>

              <a
                href="/sites"
                className="rounded-2xl border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Cancelar
              </a>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
