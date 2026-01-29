"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { buscaDesignacaoSchema } from "./schema";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import { Card } from "antd";

 


const defaultValues: BuscaDesignacaoRequest = {
  rf: ""
};

const FormularioBuscaDesignacao: React.FC<{ className?: string, onBuscaDesignacao: (values: BuscaDesignacaoRequest) => void }> = ({ className, onBuscaDesignacao }) => {
  const form = useForm<BuscaDesignacaoRequest>({
    resolver: zodResolver(buscaDesignacaoSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = (values: BuscaDesignacaoRequest) => {
    onBuscaDesignacao(values);
    console.log("Dados da designação", values);
  };

  return (

    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col h-full flex-1 "
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[50%]">
              <FormField
                control={form.control}
                name="rf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-bold">
                    RF do titular
                    </FormLabel>
                    <FormControl>
                      <InputBase
                        type="number"
                        className="medium-input"
                        {...field}
                        placeholder="Entre com RF"
                        id="rf"
                        data-testid="input-rf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
         
            <div className="w-[200px] pt-[2rem] ">
              <Button type="submit" size="lg"  className="w-full flex items-center justify-center gap-6" variant="customOutline">
                
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

export default FormularioBuscaDesignacao;
