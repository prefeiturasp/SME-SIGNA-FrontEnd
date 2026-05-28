"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react";

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
import { buscaDesignacaoSchema } from "./schema";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import SearchButton from "../../SearchButton/SearchButton";

interface FormularioBuscaDesignacaoProps {
  className?: string;
  onBuscaDesignacao: (values: BuscaDesignacaoRequest) => Promise<void>;
  label?: string;
  placeholder?: string;
  defaultValues?: BuscaDesignacaoRequest;
}

const FormularioBuscaDesignacao: React.FC<FormularioBuscaDesignacaoProps> = ({
  className,
  onBuscaDesignacao,
  label = "RF do servidor indicado",
  placeholder = "Entre com RF",
  defaultValues,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BuscaDesignacaoRequest>({
    resolver: zodResolver(buscaDesignacaoSchema),
    defaultValues: defaultValues ?? { rf: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: BuscaDesignacaoRequest) => {
    setIsLoading(true);
    try {
      await onBuscaDesignacao(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <div className="w-full flex flex-col h-full flex-1">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[90%]">
              <FormField
                control={form.control}
                name="rf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-bold">
                      {label}
                    </FormLabel>
                    <FormControl>
                      <InputBase
                        type="text"
                        placeholder={placeholder}
                        {...field}
                        data-testid="input-rf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-[30px]">

              <SearchButton
                type="button"
                isLoading={isLoading}
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
                data-testid="botao-pesquisar-servidor"
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default FormularioBuscaDesignacao;