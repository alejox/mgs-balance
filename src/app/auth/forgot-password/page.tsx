"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // Aquí irá la lógica de recuperación de contraseña
      console.log("Forgot password data:", data);
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error en recuperación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Email enviado
          </h2>
          <p className="text-gray-600 mt-2">
            Hemos enviado un enlace de recuperación a tu email. Revisa tu
            bandeja de entrada.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recuperar contraseña
        </h2>
        <p className="text-gray-600 mt-2">
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Enviar enlace de recuperación
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al login
        </Link>
      </div>
    </div>
  );
}
