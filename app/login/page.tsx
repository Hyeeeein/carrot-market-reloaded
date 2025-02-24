"use client";

import FormButton from "@/components/form-button";
import FormInput from "@/components/form-input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { handleForm } from "./actions";

export default function LogIn() {
  /* useFormState = 폼에서 에러가 발생했을 때? 사용자에게 알려줄 수 있는 방법! */
  // 결과를 알고 싶은 action 함수를 인자로 넘겨주기(form)
  // 그럼 useFormState 는 action 함수를 const result = await action함수(); 로 호출 및 리턴할 것임
  // 첫번째 아이템은 state 를 반환, action 함수의 리턴값이 될 것임
  // 두번째 아이템은 trigger 를 반환, action 함수를 실행할 때 사용!
  // action 함수와 useFormState 는 다른 곳에 있어야 함 action 함수는 server 고 useFormState 는 client 이기 때문에
  // 초기값도 필수로 세팅해야 함 보통은 null 을 세팅
  // ! action 함수에는 첫번째 매개변수로 prevState 를 넣어야 함 useFormState 는 이전 state 도 가져올 수 있기 때문에
  const [state, action] = useFormState(handleForm, null);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <FormInput
          name="email" // 아주 중요한 속성! 설정하지 않으면 formData 에 포함되지 않음!
          type="email"
          placeholder="Email"
          required
          errors={[]}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          errors={state?.errors ?? []}
        />
        <FormButton text="Log in" />
      </form>
      <SocialLogin />
    </div>
  );
}
