import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [equipo] = await query('SELECT * FROM Equipo WHERE Id_equipo=$1', [params.id]);
    if (!equipo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(equipo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, bandera, grupo } = await req.json();
    const [equipo] = await query(
      'UPDATE Equipo SET Nombre=$1, Bandera=$2, Grupo=$3 WHERE Id_equipo=$4 RETURNING *',
      [nombre, bandera || null, grupo || null, params.id]
    );
    if (!equipo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(equipo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM Equipo WHERE Id_equipo=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
