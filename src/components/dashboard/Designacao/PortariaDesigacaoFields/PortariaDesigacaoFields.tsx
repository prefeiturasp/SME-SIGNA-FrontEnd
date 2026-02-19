"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Combobox } from "@/components/ui/Combobox";

import formSchemaDesignacao, { FormDesignacaoData } from "./schema";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { InputBase } from "@/components/ui/input-base";
import { InfoItem } from "../ResumoDesignacao";
import Eye from "@/assets/icons/Eye";
import { forwardRef, useImperativeHandle, useState } from "react";

import DetalhamentoTurmasModal from "@/components/detalhamentoTurmas/detalhamentoTurmas";
import useFetchDesignacaoUnidadeMutation from "@/hooks/useDesignacaoUnidade";
import {
  DesignacaoUnidadeResponse,
  Servidor,
} from "@/types/designacao-unidade";
import ModalResumoServidor from "../ModalResumoServidor/ModalResumoServidor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription } from "@/components/ui/field";



interface Props {

  readonly setDisableProximo: (disable: boolean) => void;
  isLoading: boolean;
}



const PortariaDesigacaoFields = ({ setDisableProximo, isLoading }: Props) => {

 
  const { register, control, formState: { errors } } = useFormContext() // retrieve all hook methods

  
 

  const anos = Array.from({ length: new Date().getFullYear() - 1980 + 1 },

    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() }
    }
  )

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2
            data-testid="loading-spinner"
            className="
        h-16 w-16 text-primary 
        animate-spin 
       "
          />
        </div>
      ) : (

 
        <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 ">
          <div className="w-full">
            <FormField
              {...register("portaria_designacao")}
              control={control}
              name="portaria_designacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Portaria da designação
                  </FormLabel>
                  <FormControl
                  
                  >
                    <InputBase
                     placeholder="Nº da portaria"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-portaria-designacao"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              {...register("numero_sei")}
              control={control}
              name="numero_sei"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Nº SEI
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      placeholder="Número SEI"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-numero-sei"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">

            <FormField
              {...register("a_partir_de")}
              control={control}
              name="a_partir_de"
              
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="required text-[#42474a] font-bold">
                    A partir de
                  </FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl >
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={control}
              name="ano"
              
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Ano
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);

                      }}
                    >
                      <SelectTrigger data-testid="select-ano">
                        <SelectValue placeholder="Selecione um ano" />
                      </SelectTrigger>

                      <SelectContent>
                        {anos.map(
                          (ano: { codigo: string; nome: string }) => (
                            <SelectItem
                              key={ano.codigo}
                              value={ano.codigo}
                            >
                              {ano.nome}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              {...register("doc")}
              control={control}
              name="doc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Doc
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      placeholder="Número doc"                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-doc"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={control}
              name='carater_especial'
              render={({ field }) => (

                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">Carater Especial</FormLabel>
                  <FormControl>
                    <RadioGroup 
                    value={field.value}
                    onValueChange={field.onChange}                    
                    defaultValue="sim" className="w-fit ">
                      <div className="flex items-center mt-4 gap-3">
                        <Field orientation="horizontal">
                          <RadioGroupItem value="sim" id="doc-sim" aria-label="doc-sim" />
                          <Label htmlFor="doc-sim">Sim</Label>
                        </Field>

                        <Field orientation="horizontal">
                          <RadioGroupItem value="nao" id="doc-nao" aria-label="doc-nao"/>
                          <Label htmlFor="doc-nao">Não</Label>
                        </Field>
                      </div>
                    </RadioGroup>

                  </FormControl>
                </FormItem>
              )}
            >

            </FormField>
            </div>


 
            <div className="w-full">
              <FormField
                {...register("doc")}
                control={control}
                name="doc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Doc
                    </FormLabel>
                    <FormControl>
                      <InputBase
                      placeholder="Número doc"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value.target.value);
                        }}
                        data-testid="input-doc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>




            <div className="w-full">
              <FormField
                {...register("motivo_cancelamento")}
                control={control}
                name="motivo_cancelamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Motivo Cancelamento
                    </FormLabel>
                    <FormControl>
                      <InputBase
                      placeholder="Motivo da Cancelamento"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value.target.value);
                        }}
                        data-testid="input-motivo-cancelamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>


        // {errorMessage && (
        //         <div className="mt-2 flex items-center gap-2">
        //           <p className="text-sm text-red-600" data-testid="login-error">
        //             {errorMessage}
        //           </p>
        //         </div>




      )}
        </>
      );
};

      export default PortariaDesigacaoFields;
