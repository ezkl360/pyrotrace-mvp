import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.equipment.findMany({ include: { site: true }, orderBy: { equipmentCode: 'asc' } }));
}
