import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre } = await req.json();
    const [fase] = await query(
      'UPDATE Fase SET Nombre=$1 WHERE Id_fase=$2 RETURNING *',
      [nombre, params.id]
    );
    if (!fase) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(fase);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM Fase WHERE Id_fase=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
