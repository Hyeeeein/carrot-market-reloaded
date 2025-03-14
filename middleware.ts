import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

// 로그인하지 않은 유저는 해당 url 에만 접속 가능
// Array 보다 Object 가 빠름
const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

export async function middleware(request: NextRequest) {
  // middleware 는 강력하지만 속도에 대한 타협때문에 nodejs 에서 구동하지 않음, nodejs 의 경령화된 edge 런타임에서 실행됨
  const session = await getSession();
  //   console.log(session);
  //   // profile 에서만 미들웨어 실행
  //   if (request.nextUrl.pathname === "/profile") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (exists) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }
}

export const config = {
  // 지정한 주소에서만 미들웨어 실행
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // api|_next/static|_next/image|favicon.ico 제외한 모든 곳에서 실행
};
