"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputBase } from "@/components/ui/input-base";
import { Search } from "lucide-react";

const designacaoSchema = z.object({
  rf: z.string().min(1, "Número da unidade é obrigatório"),
  nome_do_servidor: z.string().optional(),
});

type DesignacaoFormValues = z.infer<typeof designacaoSchema>;

const defaultValues: DesignacaoFormValues = {
  rf: "",
  nome_do_servidor: "",
};

const BuscaDesignacao: React.FC<{ className?: string }> = ({ className }) => {
  const form = useForm<DesignacaoFormValues>({
    resolver: zodResolver(designacaoSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = (values: DesignacaoFormValues) => {
    console.log("Dados da designação", values);
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col h-full flex-1 my-4 py-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[28%]">
              <FormField
                control={form.control}
                name="rf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-bold">
                      RF do servidor
                    </FormLabel>
                    <FormControl>
                      <InputBase
                        className="bg-[#fff] shadow-[0_2.7px_27px_rgba(69,69,80,0.1)] font-size-[16px]"
                        {...field}
                        placeholder="Entre com RF"
                        id="rf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full md:w-[35%] lg:w-[60%]">
              <FormField
                control={form.control}
                name="nome_do_servidor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-bold">
                      Nome do servidor
                    </FormLabel>
                    <FormControl>
                      <InputBase
                        className="bg-[#fff] shadow-[0_2.7px_27px_rgba(69,69,80,0.1)] font-size-[15px]"
                        {...field}
                        placeholder="Entre com o nome"
                        id="nome_do_servidor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-[200px] pt-[2rem] ">
              <Button type="submit" size="lg"  className="w-full flex items-center justify-center gap-6" variant="destructive">
                
                <p className="text-[16px] font-bold">Pesquisar</p>
                <Search />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BuscaDesignacao;
