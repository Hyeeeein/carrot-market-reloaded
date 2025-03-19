import { userLogin } from "@/common/util";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // 현재 url 에 코드를 찾아
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }

  // 깃헙에 client_id, client_secret, 위의 code 를 포함해 사용자의 정보를 요청할 토큰 받아오기

  // 여기서부터
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    cache: "no-cache",
  });
  const { error, access_token } = await accessTokenResponse.json(); // 코드챌린지 4. 여기까지 getAccessToken 이라는 새 함수에 넣어주기 그래서 code 하나만 받아서 반환하는 함수 만들기
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  // 받아온 토큰으로 사용자의 정보 요청

  // 여기서부터
  const userProfileResponse = await fetch("https://api.github.com/user", {
    // 코드챌린지 3. /user/email 로 이메일 정보도 가져와 저장해보기 + 코드챌린지 4. getGithubEmail 함수
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache", // 기본적으로 nextjs 는 fetch request 를 캐싱하기 때문에 메모리에 저장하지 않도록 no-cache 처리
  });

  const { id, avatar_url, login } = await userProfileResponse.json(); // 코드챌린지 4. 여기까지 getGithubProfile 함수
  console.log("💙", id, avatar_url, login);
  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  console.log("user", user);

  // 받아온 정보로 db 에서 유저 찾았을 때 있으면 로그인
  if (user) await userLogin(user.id);

  // 없으면 가입 후 로그인
  const newUser = await db.user.create({
    data: {
      username: login, // 코드챌린지 2. 깃헙에서 받아온 이름이 db 에 동일한 게 있을 수 있음, 따라서 username 체크 후 있으면 랜덤 생성? 혹은 login+id 세팅
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });

  // 코드챌린지 1. 로그인 함수 만들기 여기 두곳, create account, 로그인 페이지 : 완!
  await userLogin(newUser.id);
}
