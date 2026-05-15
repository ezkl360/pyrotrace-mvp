import { Shell } from '@/components/Shell';
import { Card } from '@/components/Card';
import { prisma } from '@/lib/prisma';

export default async function CompaniesPage() {
  const companies = await prisma.organization.findMany({ orderBy: { name: 'asc' }, include: { customerLinks: { include: { providerOrg: true } }, providerLinks: { include: { customerOrg: true } } } });
  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <p className="mt-2 text-slate-600">Distingue proveedor de pirometría, cliente dueño del activo y empresa interna.</p>
      </div>
      <Card title="Registro multiempresa">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b text-slate-500"><th className="py-3">Empresa</th><th>Tipo</th><th>Relación</th><th>Notas</th></tr></thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{c.name}</td>
                <td>{c.type}</td>
                <td>{c.customerLinks.length ? `Cliente de ${c.customerLinks.map(l => l.providerOrg.name).join(', ')}` : c.providerLinks.length ? `Proveedor de ${c.providerLinks.length} empresa(s)` : 'Sin relación externa'}</td>
                <td>{c.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
