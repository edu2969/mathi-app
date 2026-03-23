"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
  }

  return (
    <div
      className="flex min-h-screen flex-1 flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/bg-vertical.png')" }}
    >
      <div className="mb-6 flex w-full max-w-sm flex-col items-center gap-3">
        <Image
          src="/titulo.png"
          alt="La historia de Mathi"
          width={572}
          height={138}
          className="h-auto w-full max-w-85 drop-shadow-lg"
          priority
        />
      </div>

      <div className="w-full max-w-sm rounded-[28px] border border-white/40 bg-white/78 p-8 shadow-2xl backdrop-blur-[2px]">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-emerald-950">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-emerald-950">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="••••••••"
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
