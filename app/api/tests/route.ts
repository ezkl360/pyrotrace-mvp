import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateScheduleSchema = z.object({
  equipmentId: z.string().min(1),
  type: z.enum(['SAT', 'TUS', 'CALIBRATION', 'THERMOCOUPLE_USAGE', 'MAINTENANCE_CHECK']),
  title: z.string().min(3),
  plannedStart: z.coerce.date(),
  plannedEnd: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  assignedToUserId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const schedules = await prisma.testSchedule.findMany({
    orderBy: { dueDate: 'asc' },
    include: { equipment: true, assignedTo: true },
  });
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateScheduleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const schedule = await prisma.testSchedule.create({ data: parsed.data });
  return NextResponse.json(schedule, { status: 201 });
}
