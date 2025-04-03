import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (!basicAuth) {
    return new NextResponse("Authorization required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const authValue = basicAuth.split(" ")[1];
  const [user, pwd] = atob(authValue).split(":");

  if (
    user !== process.env.AUTH_USERNAME ||
    pwd !== process.env.AUTH_PASSWORD
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}

// Застосовувати на всі маршрути
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|public).*)"], // 👈 Винятки для API та статичних файлів
};
