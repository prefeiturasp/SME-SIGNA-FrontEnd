"use client";

import React, { useState } from "react";

import { CustomAlert as Alert } from "@/components/ui/CustomAlert";

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
import useRecuperarSenha from "@/hooks/useRecuperarSenha";
import Link from "next/link";

export default function RecuperacaoDeSenhaTela() {
  const form = useForm({
    defaultValues: {
      seu_rf: "",
      senha: "",
    },
  });

  const recoveryPasswordMutation = useRecuperarSenha();

  const { mutateAsync: fazRecuperarSenha, isPending: estaCarregando } = recoveryPasswordMutation;

  // const [mensagemDeErro, setMensagemDeErro] = useState(
  //   {
  //   message:"Usuário ou RF não encontrado!",
  //   description:""}
  // );

  // const [mensagemDeErro, setMensagemDeErro] = useState(
  //   {
  //   message:"",
  //   description:"Olá John Doe! Desculpe, mas o acesso ao SIGNA é restrito a perfis específicos."}    //Para resolver este problema, entre em contato com o Gabinete da Diretoria Regional de Educação (DRE).
  // );

  const [mensagemDeSucesso, setMensagemDeSucesso] = useState({
    message:
      "Verifique sua caixa de entrada ou lixo eletrônico!",
    description: "Seu link de recuperação de senha foi enviado para ama***********@prefeitura.sme.gov.br",
  });

  const [mensagemDeErro, setMensagemDeErro] = useState({
    message: "E-mail não encontrado!",
    description:
      "Para resolver este problema, entre em contato com o Gabinete da Diretoria Regional de Educação (DRE).",
  });

  const onSubmit = async (values) => {
    const response = await fazRecuperarSenha(values);
    if (!response.success) {
      setMensagemDeErro(response.error);
    }
    setMensagemDeSucesso(response.message);
  };

  return (
    <div className="w-[95%] h-full flex">
      <div className="w-[60vw] h-screen relative">
        <Image
          src="/images/capa-login.png"
          alt="Login"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex items-center justify-center w-[40vw] h-screen">
        <div className="flex flex-col gap-2.5 px-8 pb-20 w-96">
          <Image
            src="/images/logo-signa.png"
            alt="Login"
            width={384}
            height={100}
          />

          <div className="py-16">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight Title">
              Recuperação de senha
            </h4>

            {mensagemDeErro && (
              <Alert
                variant="destructive"
                message={mensagemDeErro.message}
                description={mensagemDeErro.description}
              />
            )}
            {mensagemDeSucesso && (
              <Alert
                variant="success"
                message={mensagemDeSucesso.message}
                description={mensagemDeSucesso.description}
              />
            )}

            {!mensagemDeErro && (
              <p className="Paragraphy ParagraphyWrapper">
                Informe o seu usuário ou RF. Você recebera um e-mail com
                orientações para redefinir sua senha.
              </p>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* RF / CPF */}
                {/* TODO REFATORAR O CSS E TAMANHOS DE FONTE E ICONES  */}

                {!mensagemDeErro && (
                  <FormField
                    control={form.control}
                    name="seu_rf"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-1">
                          <FormLabel className="mt-2.5">RF ou CPF</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger type="button">
                                <HelpCircle className="size-4" />
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
                          <Input
                            id="seu_rf"
                            placeholder="Insira seu RF ou CPF"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {!mensagemDeErro && (
                  <div className="mt-2.5">
                    <Button
                      type="submit"
                      disabled={estaCarregando}
                      className="rounded bg-[#717FC7] text-white w-full disabled:opacity-50"
                    >
                      {estaCarregando ? "Continuando..." : "Continuar"}
                    </Button>
                  </div>
                )}

                <div className="mt-2.5">
                  <Link href="/login" className="w-full">
                    <Button
                      variant="outline"
                      className="text-[#717FC7] w-full "
                    >
                      Voltar
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </div>

          <Image
            className="self-center"
            src="/images/logo_PrefSP.png"
            alt="Login"
            width={149}
            height={47}
          />
        </div>
      </div>
    </div>
  );
}
