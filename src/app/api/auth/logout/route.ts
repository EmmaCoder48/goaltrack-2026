import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });
  
  response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
  
  return response;
}
