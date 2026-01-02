"use client";

import  { useState } from "react";

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
import LogoSigna from "@/components/login/LogoSigna";
import { EsqueciSenhaRequest } from "@/types/esqueci-senha";
import { Mensagem } from "@/types/generic";
export default function RecuperarSenha() {
  const form = useForm({
    defaultValues: {
      seu_rf: "",
      senha: "",
    },
  });

  const recoveryPasswordMutation = useRecuperarSenha();

  const { mutateAsync: fazRecuperarSenha, isPending: estaCarregando } =
    recoveryPasswordMutation;

  const estaDesabilitado = !form.formState.isDirty;

  const [mensagemDeSucesso, setMensagemDeSucesso] = useState<Mensagem>();
  const [mensagemDeErro, setMensagemDeErro] = useState<Mensagem>();

  const [mostarCampoRFOuCPF, setMostarCampoRFOuCPF] = useState(true);

  const onSubmit = async (values:EsqueciSenhaRequest) => {
    const response = await fazRecuperarSenha({ username: values.seu_rf });
    if (!response.success) {
      setMensagemDeErro(response.error);
      setMensagemDeErro({
        message: "E-mail não encontrado!",
        description:
          "Para resolver este problema, entre em contato com o Gabinete da Diretoria Regional de Educação (DRE).",
      });
      setMostarCampoRFOuCPF(false);
      return;
    }
    setMensagemDeSucesso({
      message: "Seu link de recuperação de senha foi enviado",
      description: "Verifique sua caixa de entrada ou lixo eletrônico!",
    });

    setMostarCampoRFOuCPF(false);
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col gap-2.5  mb-20 w-96">
        <div className="flex justify-center">
          <LogoSigna />
        </div>

        <div className="py-5">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight Title ">
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

          {!mensagemDeErro && !mensagemDeSucesso && (
            <p className="Paragraphy ParagraphyWrapper pb-6 pt-6 text-sm">
              Informe o seu usuário ou RF. Você recebera um e-mail com orientações para redefinir sua senha.
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
  
              {mostarCampoRFOuCPF && (
                <FormField
                  control={form.control}
                  name="seu_rf"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1">
                        <FormLabel className="text-sm">RF</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <HelpCircle className="size-4" />
                            </TooltipTrigger>
                            <TooltipContent
                              align="start"
                              className="bg-white text-black"
                            >
                              Insira seu RF
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <FormControl>
                        <Input
                          id="seu_rf"
                          placeholder="Insira seu RF"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

             

          <div className="mt-6 mb-6 bg-[#F8F9FA] p-5 rounded-2">
              <p className="Paragraphy ParagraphyWrapper p-1 text-sm">
                <b>Importante:</b> Ao alterar a sua senha, ela se tornará padrão e será utilizada para acessar todos os sistemas da SME aos quais você já possui acesso.
              </p>
            </div>

              {!mensagemDeErro && !mensagemDeSucesso && (
                <div className="mt-2.5">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={estaDesabilitado}
                    className="rounded text-white w-full disabled:opacity-50"
                    loading={estaCarregando}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              <div className="mt-2.5">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className=" w-full ">
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
  );
}
