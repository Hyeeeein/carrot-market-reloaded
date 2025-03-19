"use server";

// // import { redirect } from "next/navigation";

// /* server action = async 필수! */
// // nextjs 가 post method 를 위한 route 핸들러를 만듬!
// // 단, input 의 name 속성이 아주 중요해짐! 해당 데이터를 보내줘야 하기 때문!
// // 계속 api 를 호출하는 행위를 하면 네트워크 호출이 계속 쌓임 => 행위를 계속 하지 못하게 로딩을 만들어주자!

// export async function handleForm(prevState: any, formData: FormData) {
//   console.log(prevState);
//   console.log(formData);
//   // await new Promise((resolve) => setTimeout(resolve, 5000));
//   // redirect = 이동
//   // redirect('/')
//   return {
//     errors: ["wrong password", "password too short"],
//   };
// }

import bcrypt from "bcrypt";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { userLogin } from "@/common/util";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  // if(user){
  //   return true
  // } else {
  //   return false
  // }
  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmailExists, "An account with this email does not exist."),
  password: z.string({
    required_error: "Password is required",
  }),
  // .min(PASSWORD_MIN_LENGTH)
  // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function logIn(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = await formSchema.spa(data);
  if (!result.success) {
    // console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    // 1. 이메일로 유저 찾기 : checkEmailExists

    // 2. 사용자가 찾아졌을 때만 비밀번호의 해시값 확인
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    // 사용자가 입력한 비밀번호와 db 의 해시값과 비교
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "xxxx"
    );

    // 3. 해시값이 일치하면 사용자를 로그인
    if (ok) {
      // 4. 사용자를 /profile 로 보내기
      await userLogin(user!.id);
    } else {
      // zod 인 척..
      return {
        fieldErrors: {
          password: ["Wrong password."],
          email: [],
        },
      };
    }
  }
}
