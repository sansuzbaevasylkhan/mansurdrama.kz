import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin/auth';

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tariffs = await prisma.tariff.findMany({
      include: {
        _count: {
          select: { tariffDramas: true }
        },
        tariffDramas: {
          include: {
            drama: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to a flatter structure for the UI
    const result = tariffs.map(t => ({
      ...t,
      dramaIds: t.tariffDramas.map(td => td.dramaId),
      dramaCount: t._count.tariffDramas
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/admin/tariffs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, price, description, isActive, dramaIds, paymentPhone } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    if (!dramaIds || !Array.isArray(dramaIds) || dramaIds.length === 0) {
      return NextResponse.json({ error: 'At least one drama must be selected' }, { status: 400 });
    }

    const tariff = await prisma.$transaction(async (tx) => {
      const newTariff = await tx.tariff.create({
        data: {
          name,
          price: parseFloat(price),
          description,
          isActive: isActive ?? true,
          paymentPhone,
        },
      });

      await tx.tariffDrama.createMany({
        data: dramaIds.map((id: string) => ({
          tariffId: newTariff.id,
          dramaId: id,
        })),
      });

      return newTariff;
    });

    return NextResponse.json(tariff);
  } catch (error) {
    console.error('POST /api/admin/tariffs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
