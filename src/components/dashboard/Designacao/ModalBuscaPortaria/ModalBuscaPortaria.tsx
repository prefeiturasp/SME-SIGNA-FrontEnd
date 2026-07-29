"use client";

import { useEffect } from "react";
import {
  useForm,
  type Control,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { InputField } from "@/components/ui/FieldsForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import formSchemaBuscaPortaria, { FormBuscaPortariaData } from "./schema";

const ANOS_PARA_TRAS = 10;

const ANOS = Array.from(
  { length: ANOS_PARA_TRAS + 1 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

interface ModalBuscaPortariaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fieldLabel: string;
  anoFieldLabel: string;
  isLoading: boolean;
  errorMessage?: string | null;
  onSubmit: (portaria: string, ano: string) => void;
}

export default function ModalBuscaPortaria({
  open,
  onOpenChange,
  title,
  description,
  fieldLabel,
  anoFieldLabel,
  isLoading,
  errorMessage,
  onSubmit,
}: Readonly<ModalBuscaPortariaProps>) {
  const form = useForm<FormBuscaPortariaData>({
    resolver: zodResolver(formSchemaBuscaPortaria),
    defaultValues: { portaria: "", ano: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset({ portaria: "", ano: "" });
    }
  }, [open]);

  const registerFieldValues = form.register as unknown as UseFormRegister<FieldValues>;
  const controlFieldValues = form.control as unknown as Control<FieldValues>;

  const handleSubmit = (values: FormBuscaPortariaData) => {
    onSubmit(values.portaria, values.ano);
  };

  const handleCancelar = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-bold">{title}</DialogTitle>
          <DialogDescription className="text-[14px]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <InputField
              register={registerFieldValues}
              control={controlFieldValues}
              name="portaria"
              label={fieldLabel}
              placeholder="Digite o número da portaria"
              dataTestId="input-busca-portaria"
              disabled={isLoading}
            />

            <FormField
              control={controlFieldValues}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#313131] font-bold">
                    {anoFieldLabel}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger data-testid="select-busca-ano">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANOS.map((ano) => (
                          <SelectItem
                            key={ano}
                            value={ano}
                            data-testid={`select-item-ano-${ano}`}
                          >
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && (
              <p
                className="text-sm text-red-600"
                data-testid="erro-busca-portaria"
              >
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelar}
                disabled={isLoading}
                data-testid="botao-cancelar-busca-portaria"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isLoading}
                data-testid="botao-buscar-portaria"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Buscar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
