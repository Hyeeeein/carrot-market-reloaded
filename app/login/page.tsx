"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { logIn } from "./actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export default function LogIn() {
  /* useFormState = 폼에서 에러가 발생했을 때? 사용자에게 알려줄 수 있는 방법! */
  // 결과를 알고 싶은 action 함수를 인자로 넘겨주기(form)
  // 그럼 useFormState 는 action 함수를 const result = await action함수(); 로 호출 및 리턴할 것임
  // 첫번째 아이템은 state 를 반환, action 함수의 리턴값이 될 것임
  // 두번째 아이템은 trigger 를 반환, action 함수를 실행할 때 사용!
  // action 함수와 useFormState 는 다른 곳에 있어야 함 action 함수는 server 고 useFormState 는 client 이기 때문에
  // 초기값도 필수로 세팅해야 함 보통은 null 을 세팅
  // ! action 함수에는 첫번째 매개변수로 prevState 를 넣어야 함 useFormState 는 이전 state 도 가져올 수 있기 때문에
  const [state, dispatch] = useFormState(logIn, null);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
        />
        <Button text="Log in" />
      </form>
      <SocialLogin />
    </div>
  );
}
