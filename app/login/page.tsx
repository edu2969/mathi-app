"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";

function LoginPageContent() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setError("");
    setLoading(true);
    const { email, password } = data;
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push("/niveles");
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col md:flex-row items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/bg-vertical.png')" }}
    >
      {/* Título a la izquierda en desktop, arriba en mobile */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-end justify-center mb-8 md:mb-0 md:pr-12">
        <Image
          src="/titulo.png"
          alt="La historia de Mathi"
          width={572}
          height={138}
          className="h-auto w-full max-w-85 drop-shadow-lg md:max-w-lg"
          priority
        />
      </div>
      {/* Recuadro de login a la derecha en desktop, abajo en mobile */}
      <div className="w-full md:w-1/2 max-w-sm md:max-w-md rounded-[28px] border border-white/40 bg-white/78 p-8 shadow-2xl backdrop-blur-[2px] flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="MathiApp"
            width={198}
            height={283}
            className="h-auto w-30 drop-shadow-lg"
          />
          <p className="text-center text-sm font-medium text-emerald-950/70">
            La inteligencia que sostiene al mundo
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full" autoComplete="off">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-emerald-950">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="tu@email.com"
              {...register("email", { required: true })}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-emerald-950">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="••••••••"
              {...register("password", { required: true })}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50/95 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-emerald-950/55">
          Demo: usa cualquier email con contraseña <strong>1234</strong>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-linear-to-b from-green-800 to-green-950">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
