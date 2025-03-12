"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

// Introduction to Zod
// const formSchema = z.object({
//   username: z.string().min(3).max(10),
//   email: z.string().email(),
//   password: z.string().min(10),
//   confirm_password: z.string().min(10),
// });

const checkUsername = (username: string) => !username.includes("potato");

const checkUniqueUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  // if (user) {
  //   return false;
  // } else {
  //   return true;
  // }
  return !Boolean(user); // 위에거랑 똑같음
};

const checkUniqueEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return Boolean(user) === false;
};

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
      // .transform((username) => `🔥 ${username}`) // 데이터 변환, 꼭 리턴해줄 것
      .refine(
        // 체크하는 함수, 2번째 인자는 false 일 경우 사용자에게 나타낼 메시지
        checkUsername,
        "No potatoes allowed!"
      ),
    // .refine(checkUniqueUsername, "This username is already taken"),
    email: z.string().email().toLowerCase(),
    // .refine(
    //   checkUniqueEmail,
    //   "There is an account already registered with that email."
    // ),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  // superRefine : 앞서 입력한 게 맞지 않으면 다음 검사 중단, refine 과 유사, 첫번째 인자는 refine 하고 있는 값(object), 두번째 인자는 RefinementCtx 로 쉽게 말해 에러묶음
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      // 유효성 검사에서 에러를 추가하는 방법
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken",
        path: ["username"], // 지정하지 않으면 form 전체 에러라고 간주함
        fatal: true, // 해당 이슈가 치명적인 에러!!
      });
      return z.NEVER; // 다음 검사 중단
      // fatal + NEVER = 뒤에 다른 refine 이 있어도 실행xxx
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  // 폼 전체 검증
  .refine(checkPasswords, {
    message: "Both passwords should be the same!",
    path: ["confirm_password"], // 에러의 책임은 confirm_password, 명시하지 않으면 폼 전체 에러로 산정할 것
  });
// .superRefine(({ password, confirm_password }, ctx) => {
//   // ? 설명 안나옴 이렇게도 폼 전체 검증을 할 수 있다고 나타낸건가?
//   if (password !== confirm_password) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Two passwords should be equal",
//       path: ["confirm_password"],
//     });
//   }
// });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  // parse 는 throw 에러를 뱉어 try catch 문을 사용해야 하고 safeParse 는 유효성 검사에 대한 결과를 보냄
  // safeParseAsync : zode 가 모든 refine 함수에 대해 await 하도록 만들고 싶다면 사용 (줄임 spa)
  const result = await formSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten(); // flatten : 복잡한 error 구조를 사용자에게 message 를 바로 보낼 수 있을만큼 간단하게 변경
  } else {
    console.log(result.data);

    // 1. username 이 존재하는지 확인: checkUniqueUsername
    // 2. 이메일을 누가 사용하고 있는지 확인: checkUniqueEmail

    // 3. hash password
    // 해싱: 단방향 함수, 사용자가 입력한 password 를 해시 함수에 넣어 무작위 문자열을 받아 디비에 저장
    const hashedPassword = await bcrypt.hash(result.data.password, 12); // 해싱 알고리즘 12번 실행 => 해싱 보안 강화

    // 4. 사용자를 데이터베이스에 저장하기
    const user = await db.user.create({
      // 유저 db 에 저장
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    // 5. 로그인
    // 사용자에게 id 1번이라고 하는 쿠키 부여
    // iron session : nextjs 가 우리에게 주는 쿠키를 가지고, 쿠키 함수를 실행하면 nextjs 가 우리에게 사용자로부터 오는 쿠키를 줌, iron session 이 delicious-karrot 이라는 쿠키가 있는지 찾고, 찾지 못하면 새로 생성
    // 쿠키를 생성하고 수정하는 모든 곳에서 복붙해서 사용해야 함 => 쿠키의 이름과 비밀번호가 항상 같아야 하기 때문에
    // const cookie = await getIronSession(cookies(), {
    //   cookieName: "delicious-karrot",
    //   password: process.env.COOKIE_PASSWORD!, // 암호화 함수, 해싱과 다름
    // });
    // //@ts-ignore
    // cookie.id = user.id; // 새로 생성된 user id 를 쿠키 id 에 저장
    // await cookie.save();

    const session = await getSession();
    session.id = user.id;
    await session.save();

    // 6. redirect
    redirect("/profile");
  }
}
