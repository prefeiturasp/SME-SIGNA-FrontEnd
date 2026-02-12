"use client";

import { useState } from "react";
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
import { LoginRequest } from "@/types/login";
import { useRouter } from "next/navigation";
import LogoSigna from "../LogoSigna";
import LogoPrefeituraSPImage from "../LogoPrefeituraSP"

export default function LoginForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      seu_rf: "",
      senha: "",
    },
  });

  const loginMutation = useLogin();

  const { mutateAsync: doLogin, isPending: isLoggingIn } = loginMutation;
  const estaDesabilitado = !form.formState.isDirty;
  const [errorMessage, setErrorMessage] = useState("Olá [nome do usuário]! Desculpe, mas o acesso ao SIGNA é restrito a perfis específicos.");

  const onSubmit = async (values: LoginRequest) => {
    const response = await doLogin(values);
    if (!response.success) {
      setErrorMessage(response.error);
    }
  };

  return (
    <div className="flex items-center justify-center  ">
      <div className="flex flex-col gap-2.5  mb-20 w-96">
        <div className="flex justify-center">
          <LogoSigna />
        </div>

        <div className="pt-16 pb-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* RF / CPF */}
              <FormField
                control={form.control}
                name="seu_rf"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel>RF</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <HelpCircle className="size-4 mb-0.5" />
                          </TooltipTrigger>
                          <TooltipContent
                            align="start"
                            className="bg-white text-black"
                          >
                            Preencha os campos
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
                            Preencha os campos
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

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={estaDesabilitado}
                  loading={isLoggingIn}
                  className="rounded text-white w-full disabled:opacity-50"
                >
                  Acessar
                </Button>
              </div>

          

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => router.push("/recuperar-senha")}
              >
                <span>Esqueci minha senha</span>
              </Button>

              {errorMessage && (
                <div className="mt-4 flex items-center gap-2 border border-red-700 rounded-md p-2">
                  <p className="text-sm text-red-700 font-bold" data-testid="login-error">
                    {errorMessage}
                  </p>
                </div>
              )}
            </form>
          </Form>
        </div>

       <LogoPrefeituraSPImage alt="Login"/>
       
      </div>
    </div>
  );
}
