# PyroTrace AI MVP

Proyecto base para iniciar la programación de PyroTrace AI: plataforma web para control pirométrico, programación de pruebas, trazabilidad multiempresa y storage de reportes.

## Módulos incluidos

1. **Empresas**
   - Soporta proveedor de pirometría (`PYROMETRY_PROVIDER`).
   - Soporta empresa cliente/dueña de activos (`CUSTOMER`).
   - Relación proveedor-cliente mediante `ProviderCustomer`.
   - Cada sitio puede indicar `ownerOrganization` y `customerOrganization` para saber a qué empresa pertenece el activo.

2. **Equipos térmicos**
   - Registro de hornos/equipos.
   - Frecuencias SAT/TUS/CAL.
   - QR único.
   - Estado operativo.

3. **Programación de pruebas**
   - Tabla `TestSchedule` para SAT, TUS, calibración, uso de termopar y revisiones.
   - Fecha planeada, fecha límite, responsable, estado y recurrencia futura.

4. **Storage de reportes**
   - Tabla `Document` para reportes SAT/TUS/CAL, certificados, evidencia, procedimientos y paquetes de auditoría.
   - Campos `storageBucket` y `storagePath` preparados para Supabase Storage.
   - Versionado documental básico.

5. **Registros pirométricos**
   - Tabla `PyrometryRecord` como base común para SAT/TUS/CAL.
   - Estado humano: draft, submitted, approved, rejected, voided.
   - Relación con equipo, instrumento, termopar, patrón, documentos, aprobaciones y riesgo.

## Instalación local

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

## Variables de entorno

Usa PostgreSQL local, Supabase local o Supabase cloud.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pyrotrace?schema=public"
```

## Estructura principal

```txt
app/
  dashboard/
  companies/
  equipment/
  tests/
  reports/
  api/
components/
lib/
prisma/schema.prisma
scripts/seed.ts
```

## Próximo paso de programación

El siguiente bloque lógico es agregar formularios reales para:

- Crear empresa proveedora.
- Crear empresa cliente.
- Relacionar proveedor-cliente.
- Crear sitio perteneciente a cliente.
- Crear equipo.
- Programar SAT/TUS/CAL.
- Registrar reporte en storage.

Después conviene conectar Supabase Auth y Supabase Storage para subir PDFs reales.
