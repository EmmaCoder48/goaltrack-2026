import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const usuarios = await query(
      'SELECT Id_usuario, Nombre, Username FROM Usuario ORDER BY Nombre'
    );
    return NextResponse.json(usuarios);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, username, password } = await req.json();
    if (!nombre?.trim() || !username?.trim() || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Check username unique
    const existing = await query('SELECT Id_usuario FROM Usuario WHERE Username=$1', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'El username ya existe' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const [usuario] = await query(
      'INSERT INTO Usuario (Nombre, Username, Password) VALUES ($1,$2,$3) RETURNING Id_usuario, Nombre, Username',
      [nombre.trim(), username.trim(), hashed]
    );
    return NextResponse.json(usuario, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
