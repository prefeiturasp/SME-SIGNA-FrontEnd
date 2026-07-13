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
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/FieldsForm";

import formSchemaBuscaPortaria, { FormBuscaPortariaData } from "./schema";

interface ModalBuscaPortariaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fieldLabel: string;
  isLoading: boolean;
  errorMessage?: string | null;
  onSubmit: (portaria: string) => void;
}

export default function ModalBuscaPortaria({
  open,
  onOpenChange,
  title,
  description,
  fieldLabel,
  isLoading,
  errorMessage,
  onSubmit,
}: Readonly<ModalBuscaPortariaProps>) {
  const form = useForm<FormBuscaPortariaData>({
    resolver: zodResolver(formSchemaBuscaPortaria),
    defaultValues: { portaria: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset({ portaria: "" });
    }
  }, [open]);

  const registerFieldValues = form.register as unknown as UseFormRegister<FieldValues>;
  const controlFieldValues = form.control as unknown as Control<FieldValues>;

  const handleSubmit = (values: FormBuscaPortariaData) => {
    onSubmit(values.portaria);
  };

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
            className="flex flex-col gap-2"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <InputField
                  register={registerFieldValues}
                  control={controlFieldValues}
                  name="portaria"
                  label={fieldLabel}
                  placeholder="Digite o número da portaria"
                  dataTestId="input-busca-portaria"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="mt-[26px] flex items-center gap-2"
                disabled={isLoading}
                data-testid="botao-buscar-portaria"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Buscar
              </Button>
            </div>

            {errorMessage && (
              <p
                className="text-sm text-red-600"
                data-testid="erro-busca-portaria"
              >
                {errorMessage}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
