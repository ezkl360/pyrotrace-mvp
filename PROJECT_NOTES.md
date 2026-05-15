# Cambios incorporados al alcance

## 1. Módulo de programación de pruebas

Entidad principal: `TestSchedule`.

Permite programar:
- SAT
- TUS
- Calibration
- Thermocouple usage
- Maintenance check

Campos críticos:
- Equipo
- Tipo de prueba
- Fecha planeada
- Fecha límite
- Responsable
- Estado
- Regla de recurrencia futura
- Notas

## 2. Storage para reportes de calibración o pruebas

Entidad principal: `Document`.

Permite almacenar metadatos de:
- Reportes SAT
- Reportes TUS
- Reportes de calibración
- Certificados
- Evidencia fotográfica
- Procedimientos
- Paquetes de auditoría

La ruta queda preparada para Supabase Storage:

```txt
storageBucket/storagePath
```

Ejemplo:

```txt
pyrotrace-reports/providerId/customerId/HT-001/CAL/HT-001_CAL_2026-05.pdf
```

## 3. Empresa a la que pertenece el activo o servicio

Para el caso donde una empresa de pirometría atiende a otras empresas:

- `Organization` identifica empresas.
- `OrganizationType` distingue proveedor, cliente o empresa interna.
- `ProviderCustomer` vincula proveedor con cliente.
- `Site.ownerOrganizationId` indica quién administra/presta el servicio.
- `Site.customerOrganizationId` indica quién es dueño del sitio/equipo cuando aplica.

Esto permite escenarios como:

> PyroMet Services Demo realiza SAT/TUS/CAL para AeroHeat Customer Plant, y los equipos pertenecen al cliente.

## 4. Orden recomendado de desarrollo

1. Base de datos y seed.
2. Dashboard.
3. CRUD empresas.
4. CRUD sitios y equipos.
5. Programación de pruebas.
6. Registro documental en storage.
7. Registros SAT/TUS/CAL.
8. Aprobaciones.
9. Audit trail.
10. Reportes PDF.
