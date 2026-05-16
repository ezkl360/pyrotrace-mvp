import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function formatTemperatureUnit(value: string) {
  if (value === "CELSIUS") return "Celsius °C";
  if (value === "FAHRENHEIT") return "Fahrenheit °F";
  return value;
}

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    include: {
      ownerOrganization: true,
      customerOrganization: true,
    },
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
              Plantas / Sitios
            </h1>

            <p className="mt-3 max-w-3xl text-slate-300">
              Administra plantas, ubicaciones o sitios donde se encuentran los
              equipos térmicos. Cada sitio tiene una unidad de temperatura
              predeterminada, pero cada equipo puede tener su propia unidad.
            </p>
          </div>

          <a
            href="/sites/new"
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300"
          >
            Nuevo sitio
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Sitio</th>
                <th className="px-6 py-4 font-semibold">Empresa operadora</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Unidad default</th>
                <th className="px-6 py-4 font-semibold">Ubicación</th>
                <th className="px-6 py-4 font-semibold">Creado</th>
              </tr>
            </thead>

            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No hay plantas o sitios registrados todavía.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-t border-slate-800 hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-4 font-medium text-cyan-300">
                      {site.code}
                    </td>

                    <td className="px-6 py-4 font-medium text-white">
                      {site.name}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {site.ownerOrganization.name}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {site.customerOrganization?.name ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {formatTemperatureUnit(site.defaultTemperatureUnit)}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {[site.city, site.state, site.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {site.createdAt.toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Dashboard
          </a>

          <a
            href="/organizations"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            Empresas
          </a>
        </div>
      </section>
    </main>
  );
}
