import { redirect } from "next/navigation";

// route 파일로 url 의 특정 http method handler 를 만들 수 있어~!
export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user,user:email", // 사용자로부터 원하는 데이터 뭐야!
    allow_signup: "true", // 사용자가 깃헙에 가입해서 정보를 가져오는 것도 허용? 아님 로그인만?
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return redirect(finalUrl);
}
