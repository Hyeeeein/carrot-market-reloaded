import { InputHTMLAttributes } from "react";

// type? interface? 딱히 이유가 없다면 interface!
interface InputProps {
  // InputHTMLAttributes 를 설정했기 때문에 아래 주석 가능
  // type: string;
  // placeholder: string;
  // required: boolean;
  errors?: string[];
  name: string; // 필수값으로 지정하기 위해 주석 x
}

export default function Input({
  errors = [],
  name,
  ...rest
}: // input 속성도 같이 선언할 수 있다고 알려주기
InputProps & InputHTMLAttributes<HTMLInputElement>) {
  console.log(rest);

  return (
    <div className="flex flex-col gap-2">
      <input
        {...rest}
        name={name}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400"
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
}
