"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";

// 각각 검증
const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

// coerce(강제) : 사용자가 입력한 string 을 number 로 변환시켜줌 (사용자가 abc 같은 걸 입력하면 에러?)
const tokenSchema = z.coerce.number().min(100000).max(999999);

interface ActionState {
  token: boolean;
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
      return {
        token: true,
      };
    }
  } else {
    const result = tokenSchema.safeParse(token);
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      redirect("/");
    }
  }
}
