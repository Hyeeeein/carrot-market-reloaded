"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";

// Introduction to Zod
// const formSchema = z.object({
//   username: z.string().min(3).max(10),
//   email: z.string().email(),
//   password: z.string().min(10),
//   confirm_password: z.string().min(10),
// });

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string!", // 사용자가 지정하지 앉은 타입으로 입력했을 때
        required_error: "Where is my username???", // 필수 값인데 입력 안했을 때
      })
      // .min(3, "Way too short!!!")
      // .max(10, "That is too looooong!")
      .trim() // 데이터 변환
      .toLowerCase() // 데이터 변환
      .transform((username) => `🔥 ${username}`) // 데이터 변환, 꼭 리턴해줄 것
      .refine(
        // 체크하는 함수, 2번째 인자는 false 일 경우 사용자에게 나타낼 메시지
        (username) => !username.includes("potato"),
        "No potatoes allowed!"
      ),
    email: z.string().email(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  // 폼 전체 검증
  // .refine(checkPasswords, {
  //   message: "Both passwords should be the same!",
  //   path: ["confirm_password"], // 에러의 책임은 confirm_password, 명시하지 않으면 폼 전체 에러로 산정할 것
  // })
  .superRefine(({ password, confirm_password }, ctx) => {
    // ? 설명 안나옴 이렇게도 폼 전체 검증을 할 수 있다고 나타낸건가?
    if (password !== confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Two passwords should be equal",
        path: ["confirm_password"],
      });
    }
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  // parse 는 throw 에러를 뱉어 try catch 문을 사용해야 하고 safeParse 는 유효성 검사에 대한 결과를 보냄
  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten(); // flatten : 복잡한 error 구조를 사용자에게 message 를 바로 보낼 수 있을만큼 간단하게 변경
  } else {
    console.log(result.data);
  }
}
