"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputBase } from "@/components/ui/input-base";
import { ResumoDesignacaoBody } from "@/types/busca-servidor-designacao";

const designacaoSchema = z.object({
  nome_da_unidade: z.string().min(1, "Número da unidade é obrigatório"),
  estrutura_hierarquica: z.string().optional(),
  turmas: z.string().optional(),
  funcionarios_da_unidade: z.string().optional(),
  assistente_de_diretor_escolar: z.string().optional(),
  secretario_da_escola: z.string().optional(),
  funcao_atividade: z.string().optional(),
  cargo_sobreposto: z.string().optional(),
  modulos: z.string().optional(),
});

 
const defaultValues: ResumoDesignacaoBody = {
  nome_da_unidade: "",
  estrutura_hierarquica: "",
  turmas: "",
  funcionarios_da_unidade: "",
  assistente_de_diretor_escolar: "",
  secretario_da_escola: "",
  funcao_atividade: "",
  cargo_sobreposto: "",
  modulos: "",
};

const FormularioDesignacao: React.FC<{
  className?: string;
  onSubmitDesignacao: (values: ResumoDesignacaoBody) => void;
}> = ({ className, onSubmitDesignacao }) => {
  const form = useForm<ResumoDesignacaoBody>({
    resolver: zodResolver(designacaoSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = (values: ResumoDesignacaoBody) => {
    onSubmitDesignacao(values);
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col h-full flex-1"
          data-testid="form-designacao"
        >
          <div className="grid lg:grid-cols-2 md:items-center md:text-left gap-4">
            <FormField
              control={form.control}
              name="nome_da_unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Nome da unidade
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      placeholder="Nome da unidade"
                      id="nome_da_unidade"
                      className="bg-[#fff]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estrutura_hierarquica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Estrutura hierárquica
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      placeholder="Entre com a estrutura hierárquica"
                      id="estrutura_hierarquica"
                      className="bg-[#fff]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turmas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">Turmas</FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      placeholder="Turmas"
                      id="turmas"
                      className="bg-[#fff]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="funcionarios_da_unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Funcionários da unidade
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="funcionarios_da_unidade"
                      className="bg-[#fff]"
                      placeholder="Servidor escolar"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistente_de_diretor_escolar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Assistente de diretor escolar
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="assistente_de_diretor_escolar"
                      className="bg-[#fff]"
                      placeholder="Entre com assistente de diretor escolar"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretario_da_escola"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Secretário da escola
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="secretario_da_escola"
                      className="bg-[#fff]"
                      placeholder="Entre com secretário da escola"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="funcao_atividade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Função atividade
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="funcao_atividade"
                      className="bg-[#fff]"
                      placeholder="Entre com função/atividade"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo_sobreposto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">
                    Cargo sobreposto
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="cargo_sobreposto"
                      className="bg-[#fff]"
                      placeholder="Entre com cargo sobreposto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modulos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] ">Módulos</FormLabel>
                  <FormControl>
                    <InputBase
                      {...field}
                      id="modulos"
                      className="bg-[#fff]"
                      placeholder="Entre com módulos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormularioDesignacao;
