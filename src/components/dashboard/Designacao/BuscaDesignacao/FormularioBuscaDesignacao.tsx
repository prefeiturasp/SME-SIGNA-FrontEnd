"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react"; // Import único e organizado

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

interface FormularioBuscaDesignacaoProps {
  className?: string;
  onBuscaDesignacao: (values: BuscaDesignacaoRequest) => Promise<void>;
  label?: string;
  placeholder?: string;
}

const FormularioBuscaDesignacao: React.FC<FormularioBuscaDesignacaoProps> = ({ 
  className, 
  onBuscaDesignacao,
  label = "RF do servidor indicado",
  placeholder = "Entre com RF" 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BuscaDesignacaoRequest>({
    resolver: zodResolver(buscaDesignacaoSchema),
    defaultValues: { rf: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: BuscaDesignacaoRequest) => {
    setIsLoading(true);
    try {
      await onBuscaDesignacao(values);
      console.log("Dados da designação", values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col h-full flex-1"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end"> 
            <div className="w-full md:w-[50%]">
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

            <div className="w-[200px]">
              <Button
                type="submit"
                size="lg"
                className="w-full flex items-center justify-center gap-6"
                variant="customOutline"
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold">
                    {isLoading ? "Pesquisando..." : "Pesquisar"}
                  </span>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                </div>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormularioBuscaDesignacao;