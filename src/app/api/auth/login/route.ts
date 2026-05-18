import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const [usuario] = await query<any>('SELECT * FROM Usuario WHERE Username=$1', [username]);

    if (!usuario) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const valid = await comparePassword(password, usuario.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = signToken({ id: usuario.id_usuario, nombre: usuario.nombre, username: usuario.username });

    const res = NextResponse.json({
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      username: usuario.username,
    });
    res.cookies.set('auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
