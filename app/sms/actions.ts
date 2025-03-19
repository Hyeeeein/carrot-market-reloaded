"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import crypto from "crypto";
import getSession from "@/lib/session";

// 각각 검증
const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return Boolean(exists);
}

// coerce(강제) : 사용자가 입력한 string 을 number 로 변환시켜줌 (사용자가 abc 같은 걸 입력하면 에러?)
const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "This token does not exist.");

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  } else {
    return token;
  }
}

export async function smsLogIn(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");
  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // 1. 이전의 토큰 삭제 : phone 이 같은 유저에 연결된 모든 토큰 삭제
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data, // zod 가 phone 값을 parse 할 때 전달하는 값
          },
        },
      });

      // 2. 새로운 토큰 생성
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data, // 기존에 있는 유저에 넣어주거나
              },
              create: {
                // 새로 만들어주기
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });

      // 3. 생성된 토큰을 sms(twilio) 로 유저에게 보내기
      return {
        token: true,
      };
    }
  } else {
    // 1. 토큰 유효성 검사
    const result = await tokenSchema.spa(token);

    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      // 2. 토큰에 연결된 유저가 누군지 알 수 있도록 토큰의 유저 아이디 얻기
      // 3. 유저 로그인
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        },
      });
      const session = await getSession();
      session.id = token!.userId;
      await session.save();
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });
      redirect("/");
    }
  }
}
