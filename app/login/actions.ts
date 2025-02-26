"use server";

// import { redirect } from "next/navigation";

/* server action = async 필수! */
// nextjs 가 post method 를 위한 route 핸들러를 만듬!
// 단, input 의 name 속성이 아주 중요해짐! 해당 데이터를 보내줘야 하기 때문!
// 계속 api 를 호출하는 행위를 하면 네트워크 호출이 계속 쌓임 => 행위를 계속 하지 못하게 로딩을 만들어주자!

export async function handleForm(prevState: any, formData: FormData) {
  // console.log(prevState);
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  // redirect = 이동
  // redirect('/')
  return {
    errors: ["wrong password", "password too short"],
  };
}
