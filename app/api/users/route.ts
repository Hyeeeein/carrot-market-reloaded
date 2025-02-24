// 렌더링? 페이지 api 는? route handler
// api route = http 요청을 받아 json 을 반환하거나 사용자를 다른 어딘가로 이동
// android, ios, webhook 를 위한 백엔드를 만들어야 한다면 /api/users 유용한 방법
// 하지만 server actions 가 나오면서 쓰지 않음xx

import { NextRequest } from "next/server";

// http 메서드
export async function GET(request: NextRequest) {
  console.log(request);
  return Response.json({
    ok: true,
  });
}

// NextRequest 는 쿠키, ip, 위치, 현재 사용자 url, 이동할 url 정보 제공
export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data);
  return Response.json(data);
}
