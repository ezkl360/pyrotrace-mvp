import { Shell } from '@/components/Shell';
import { Card } from '@/components/Card';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export default async function ReportsPage() {
  const docs = await prisma.document.findMany({ orderBy: { createdAt: 'desc' }, include: { organization: true, equipment: true, record: true }, take: 50 });
  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Storage de reportes</h1>
        <p className="mt-2 text-slate-600">Repositorio documental para reportes SAT/TUS/CAL, certificados, evidencia y paquetes de auditoría.</p>
      </div>
      <Card title="Documentos almacenados">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b text-slate-500"><th className="py-3">Fecha</th><th>Categoría</th><th>Título</th><th>Empresa</th><th>Equipo</th><th>Ruta storage</th><th>Versión</th></tr></thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-3">{format(d.createdAt, 'yyyy-MM-dd')}</td>
                <td>{d.category}</td>
                <td className="font-medium">{d.title}</td>
                <td>{d.organization.name}</td>
                <td>{d.equipment?.equipmentCode ?? '—'}</td>
                <td className="font-mono text-xs">{d.storageBucket}/{d.storagePath}</td>
                <td>v{d.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
