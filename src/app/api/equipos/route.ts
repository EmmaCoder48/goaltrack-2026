import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const equipos = await query('SELECT * FROM Equipo ORDER BY Grupo, Nombre');
    return NextResponse.json(equipos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, bandera, grupo } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const [equipo] = await query(
      'INSERT INTO Equipo (Nombre, Bandera, Grupo) VALUES ($1,$2,$3) RETURNING *',
      [nombre.trim(), bandera || null, grupo || null]
    );
    return NextResponse.json(equipo, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
