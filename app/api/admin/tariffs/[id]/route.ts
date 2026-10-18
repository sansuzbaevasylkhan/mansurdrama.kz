import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, price, description, isActive, dramaIds, paymentPhone } = body;

    if (dramaIds !== undefined && (!Array.isArray(dramaIds) || dramaIds.length === 0)) {
      return NextResponse.json({ error: 'At least one drama must be selected' }, { status: 400 });
    }

    const tariff = await prisma.$transaction(async (tx) => {
      const updatedTariff = await tx.tariff.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          price: price !== undefined ? parseFloat(price) : undefined,
          description: description !== undefined ? description : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
          paymentPhone: paymentPhone !== undefined ? paymentPhone : undefined,
        },
      });

      if (dramaIds !== undefined) {
        // Replace existing associations
        await tx.tariffDrama.deleteMany({
          where: { tariffId: id },
        });

        await tx.tariffDrama.createMany({
          data: dramaIds.map((dId: string) => ({
            tariffId: id,
            dramaId: dId,
          })),
        });
      }

      return updatedTariff;
    });

    return NextResponse.json(tariff);
  } catch (error) {
    console.error(`PATCH /api/admin/tariffs/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.tariff.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tariff deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/admin/tariffs/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
