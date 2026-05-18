import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, username, password } = await req.json();

    if (password) {
      const hashed = await hashPassword(password);
      const [u] = await query(
        'UPDATE Usuario SET Nombre=$1, Username=$2, Password=$3 WHERE Id_usuario=$4 RETURNING Id_usuario, Nombre, Username',
        [nombre, username, hashed, params.id]
      );
      return NextResponse.json(u);
    } else {
      const [u] = await query(
        'UPDATE Usuario SET Nombre=$1, Username=$2 WHERE Id_usuario=$3 RETURNING Id_usuario, Nombre, Username',
        [nombre, username, params.id]
      );
      return NextResponse.json(u);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM Usuario WHERE Id_usuario=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
