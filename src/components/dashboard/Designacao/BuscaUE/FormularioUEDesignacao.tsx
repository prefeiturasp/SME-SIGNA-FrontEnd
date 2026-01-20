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
import { Button } from "@/components/ui/button";

import formSchemaDesignacao, {
  FormDesignacaoData,
} from "./schema";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";


interface Props {
  readonly onSubmitDesignacao: (values: FormDesignacaoData) => void;
}

export default function FormularioUEDesignacao({
  onSubmitDesignacao,
}: Props) {
  const { data: dreOptions = [] } = useFetchDREs();

  console.log("dreOptions", dreOptions)

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
  const onProximo = () => {};

  console.log("ueOptions", ueOptions)


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitDesignacao)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <BotoesDeNavegacao
            disableAnterior={true}
            disableProximo={true}
            onProximo={onProximo}
            onAnterior={() => {}}
        />
      </form>
    </Form>
  );
}
