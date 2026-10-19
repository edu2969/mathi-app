"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { FaGoogle, FaFacebook } from "react-icons/fa";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Mostrar mensajes según query params (verificación de email)
  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("error");

  const handleOAuth = (provider: "google" | "facebook") => {
    setError("");
    signIn(provider, { callbackUrl: "/levels" });
  };

  const onSubmit = async (data: any) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (res?.error) {
          setError("Email o contraseña incorrectos");
        } else {
          router.push("/levels");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name,
            role: "ESTUDIANTE",
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Error al registrar");
        } else {
          setSuccess(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."
          );
          setMode("login");
        }
      }
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
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

      {/* Recuadro de auth */}
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

        {/* Mensajes de estado */}
        {verified === "1" && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 text-center">
            ✅ Correo confirmado. Ya puedes iniciar sesión.
          </p>
        )}
        {verifyError === "token_expirado" && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
            ⚠️ El enlace de confirmación expiró. Solicita uno nuevo.
          </p>
        )}
        {verifyError === "token_invalido" && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
            ⚠️ Enlace de confirmación inválido.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50/95 px-3 py-2 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 text-center">
            {success}
          </p>
        )}

        {/* Pestañas Login / Registro */}
        <div className="flex w-full mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-tl-[28px] rounded-tr-[28px] font-medium transition-colors ${
              mode === "login"
                ? "bg-emerald-700 text-white"
                : "bg-white/50 text-emerald-950/60 border-b border-emerald-200"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-tr-[28px] rounded-tl-[28px] font-medium transition-colors ${
              mode === "register"
                ? "bg-emerald-700 text-white"
                : "bg-white/50 text-emerald-950/60 border-b border-emerald-200"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full" autoComplete="off">
          {/* Separador con "o" para login */}
          {mode === "login" && (
            <>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-emerald-200"></span>
                </div>
                <span className="relative text-xs font-medium text-emerald-950/40 bg-white/78 px-2">
                  o continúa con
                </span>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-50 disabled:opacity-60"
                >
                  <FaGoogle size={18} /> Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("facebook")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-50 disabled:opacity-60"
                >
                  <FaFacebook size={18} /> Meta
                </button>
              </div>
            </>
          )}

          {mode === "login" ? (
            <>
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
                  {...register("email", { required: "Email requerido" })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>
                )}
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
                  {...register("password", { required: "Contraseña requerida" })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.password.message)}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? "Ingresando…" : "Ingresar"}
              </button>
              <p className="mt-4 text-center text-xs text-emerald-950/55">
                Demo: usa cualquier email con contraseña <strong>1234</strong>
              </p>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-emerald-950">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Tu nombre"
                  {...register("name", { required: "Nombre requerido" })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.name.message)}</p>
                )}
              </div>
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
                  {...register("email", { required: "Email requerido" })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-emerald-950">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-emerald-900/15 bg-white/85 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="••••••••"
                  {...register("password", { required: "Contraseña requerida", minLength: 6 })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.password.message)}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? "Registrando…" : "Crear cuenta"}
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-emerald-950/55">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-emerald-700 hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
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
