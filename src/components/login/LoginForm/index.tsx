"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import useLogin from "@/hooks/useLogin";
import Link from "next/link";

export default function LoginForm() {
  const form = useForm({
    defaultValues: {
      seu_rf: "",
      senha: "",
    },
  });

  const loginMutation = useLogin();

  const { mutateAsync: doLogin, isPending: isLoggingIn } = loginMutation;

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (values) => {
    const response = await doLogin(values);
    if (!response.success) {
      setErrorMessage(response.error);
    }
  };

  return (
      <div className="flex flex-col gap-2.5 px-8 pb-20 w-96">
        <Image
          src="/images/logo-signa.png"
          alt="Login"
          width={384}
          height={100}
        />

        <div className="pt-16 pb-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* RF / CPF */}
              <FormField
                className="mb-2"
                control={form.control}
                name="seu_rf"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel>RF ou CPF</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <HelpCircle className="size-4 mb-0.5" />
                          </TooltipTrigger>
                          <TooltipContent
                            align="start"
                            className="bg-white text-black"
                          >
                            Digite seu RF ou CPF
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <FormControl>
                      <Input id="seu_rf" placeholder="Seu RF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SENHA */}
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center gap-1 mt-2">
                      <FormLabel>Senha</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <HelpCircle className="size-4 mb-0.5" />
                          </TooltipTrigger>
                          <TooltipContent
                            align="start"
                            className="bg-white text-black"
                          >
                            Digite sua Senha
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <FormControl>
                      <Input
                        type="password"
                        id="senha"
                        placeholder="Sua senha"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="mt-2 text-sm" />
                  </FormItem>
                )}
              />

              <div className="mt-2.5">
                <Button
                  type="submit"
                  variant="submit"
                  disabled={isLoggingIn}
                  loading={isLoggingIn}
                  className="rounded w-full disabled:opacity-50"
                >
                  Acessar
                </Button>
              </div>

              {errorMessage && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-red-600" data-testid="login-error">
                    {errorMessage}
                  </p>
                </div>
              )}

              <Button asChild variant="link" className="w-full">
                <Link href="/recuperar-senha" className="w-full">
                  <span>Esqueci minha senha</span>
                </Link>
              </Button>
            </form>
          </Form>
        </div>

        <Image
          src="/images/logo_PrefSP.png"
          alt="Login"
          width={149}
          height={47}
          className="self-center  pb-4"
        />
        <Button asChild variant="customOutline" className="w-full mt-2">
          <Link href="/">Cadastre-se</Link>
        </Button>
      </div>
   );
}
