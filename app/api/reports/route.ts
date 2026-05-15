import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateDocumentSchema = z.object({
  organizationId: z.string().min(1),
  equipmentId: z.string().optional(),
  recordId: z.string().optional(),
  category: z.enum(['SAT_REPORT', 'TUS_REPORT', 'CALIBRATION_REPORT', 'CERTIFICATE', 'PHOTO_EVIDENCE', 'PROCEDURE', 'AUDIT_PACKAGE', 'OTHER']),
  title: z.string().min(3),
  fileName: z.string().min(3),
  storageBucket: z.string().default('pyrotrace-reports'),
  storagePath: z.string().min(3),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  checksum: z.string().optional(),
});

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { organization: true, equipment: true, record: true },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateDocumentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const document = await prisma.document.create({ data: parsed.data });
  return NextResponse.json(document, { status: 201 });
}
