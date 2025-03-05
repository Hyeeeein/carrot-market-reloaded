"use client";

import { useFormStatus } from "react-dom";

type ButtonProps = {
  text: string;
};

export default function Button({ text }: ButtonProps) {
  /* useFormStatus = 리액트 제공, form action 의 작업 상태(panding? 어떤 데이터를 전송?)를 알려주는 hook */
  // 단!! action 을 실행하는 form 과 같은 곳에서 사용xxx, form 의 자식에서만 사용
  // 그래서 자동으로 form 을 찾아서 어떤 상태인지 알려줌!
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="primary-btn h-10 disabled:bg-neutral-400  disabled:text-neutral-300 disabled:cursor-not-allowed"
    >
      {pending ? "로딩 중" : text}
    </button>
  );
}
