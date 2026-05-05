import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Проверяем: логин admin, пароль из .env.local
    if (user === 'admin' && pwd === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  // Если пароля нет или он неверный — показываем окно браузера
  return new NextResponse('Доступ запрещен. Требуется авторизация.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  // Защищаем строго страницу /admin и все что внутри нее
  matcher: ['/admin', '/admin/:path*'], 
};