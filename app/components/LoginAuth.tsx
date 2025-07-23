"use client";

import { HTMLAttributes, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/components/actions";

export function LoginAuth() {

    const [state, loginAction] = useActionState(login, undefined);

    const inputClassName: HTMLAttributes<string>["className"] = "w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm";

    return (
        <div className="flex items-center justify-center z-50">
            <form action={loginAction} className="flex max-w-[300px] flex-col gap-2" >
            <div className="flex flex-col gap-2">
                <input
                    id="email"
                    name="email"
                    placeholder="Email"
                    className={inputClassName}
                />
            </div>
            {state?.errors?.email && (
                <p className="text-red-500">{state.errors.email}</p>
            )}

            <div className="flex flex-col gap-2">
                <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className={inputClassName}
                />
            </div>
            {state?.errors?.password && (
                <p className="text-red-500">{state.errors.password}</p>
            )}
            <SubmitButton />
            </form>
        </div>

    );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      Login
    </button>
  );
}