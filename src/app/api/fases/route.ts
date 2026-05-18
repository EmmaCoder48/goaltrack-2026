import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const fases = await query('SELECT * FROM Fase ORDER BY Id_fase');
    return NextResponse.json(fases);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const [fase] = await query(
      'INSERT INTO Fase (Nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    );
    return NextResponse.json(fase, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
