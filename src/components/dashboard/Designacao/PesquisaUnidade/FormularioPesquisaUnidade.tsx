"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import formSchemaDesignacao, {
  FormDesignacaoData,
} from "./schema";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { InputBase } from "@/components/ui/input-base";
import { InfoItem } from "../ResumoDesignacao";


interface Props {
  readonly onSubmitDesignacao: (values: FormDesignacaoData) => void;
}

export default function FormularioPesquisaUnidade({
  onSubmitDesignacao,
}: Props) {
  const { data: dreOptions = [] } = useFetchDREs();

 
  const form = useForm<FormDesignacaoData>({
    resolver: zodResolver(formSchemaDesignacao),
    defaultValues: {
      dre: "",
      ue: "",
    },
    mode: "onChange",
  });

  const values = form.watch();
  const { data: ueOptions = [] } = useFetchUEs(values.dre);
 
  console.log("ueOptions", ueOptions)


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitDesignacao)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-row gap-5">

          <div className="w-full md:w-[15%]">
            <FormField
              control={form.control}
              name="dre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Selecione a DRE
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("ue", "");
                      }}
                      data-testid="select-dre"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>
                        {dreOptions.map(
                          (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => (
                            <SelectItem key={dre.siglaDRE} value={dre.codigoDRE}>
                              {dre.nomeDRE}
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

          <div className="w-full md:w-[75%]">
            <FormField

              control={form.control}
              name="ue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Selecione a UE
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={ueOptions.map(
                        (ue: { codigoEol: string; nomeOficial: string }) => ({
                          label: ue.nomeOficial,
                          value: ue.codigoEol,
                        })
                      )}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Digite o nome da UE"
                      disabled={!values.dre}
                      data-testid="select-ue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-[150px] pt-[2rem] ">
            <Button type="submit" className="w-full flex items-center justify-center gap-6" variant="customOutline">

              <p className="text-[16px] font-bold">Pesquisar</p>
              <Search />
            </Button>
          </div>



        </div>
        <div className="flex flex-row gap-5">

          <div className="w-full md:w-[15%]">
            <FormField
              control={form.control}
              name="codigo_estrutura_hierarquica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                  Código Estrutura hierárquica 
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                        form.setValue("codigo_estrutura_hierarquica", value.target.value);
                      }}
                      data-testid="input-codigo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full md:w-[15%] mt-6">
          <InfoItem label="Qtd. Turmas" value={'20'} />

          </div>

          <div className="w-full md:w-[75%]">
            <FormField
              control={form.control}
              name="dre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Selecione a DRE
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("ue", "");
                      }}
                      data-testid="select-dre"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>
                        {dreOptions.map(
                          (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => (
                            <SelectItem key={dre.siglaDRE} value={dre.codigoDRE}>
                              {dre.nomeDRE}
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



        </div>


      </form>
    </Form>
  );
}
