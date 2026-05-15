import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              PyroTrace AI
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
              Empresas
            </h1>

            <p className="mt-3 max-w-3xl text-slate-300">
              Administración de empresas proveedoras de pirometría, empresas
              internas de tratamiento térmico y clientes externos.
            </p>
          </div>

          <a
            href="/organizations/new"
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300"
          >
            Nueva empresa
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Razón social</th>
                <th className="px-6 py-4 font-semibold">RFC / Tax ID</th>
                <th className="px-6 py-4 font-semibold">Creada</th>
              </tr>
            </thead>

            <tbody>
              {organizations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No hay empresas registradas todavía.
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="border-t border-slate-800 hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {org.name}
                    </td>

                    <td className="px-6 py-4 text-slate-300">{org.type}</td>

                    <td className="px-6 py-4 text-slate-300">
                      {org.legalName ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {org.taxId ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {org.createdAt.toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Volver al dashboard
          </a>
        </div>
      </section>
    </main>
  );
}

