"use client";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/Combobox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useModalSelecaoDeCargo } from "@/hooks/useModalSelecaoDeCargo";
import { FormProvider } from "react-hook-form";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Loader2 } from "lucide-react";
import { Tooltip } from "antd";
import type { formSchemaSelecaoDeCargoData } from "./formSchemaSelecaoDeCargo";
import type { ICargoType } from "@/types/cargos";

interface ModalSelecaoDeCargoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (values: formSchemaSelecaoDeCargoData, cargo: ICargoType | undefined) => void;
}

export default function ModalSelecaoDeCargo({ isOpen, onClose, onConfirm }: Readonly<ModalSelecaoDeCargoProps>) {

  const { filterForm, onSubmitFilterForm, cargosOpcoes, isLoadingCargos } =
    useModalSelecaoDeCargo({ onConfirm, onClose });

  const cargosOpcoesCombobox = cargosOpcoes.map((cargo: ICargoType) => ({
    value: String(cargo.codigoCargo),
    label: cargo.nomeCargo,
  }));

  return (
    <FormProvider {...filterForm}>
      <Dialog open={isOpen}>
        <DialogContent className="max-w-[560px] p-8 overflow-y-auto max-h-[90vh]" closeButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-[20px] font-bold">Selecione um cargo</DialogTitle>
            <DialogDescription className="text-sm text-black">
              Após a seleção, você poderá cadastrar as informações complementares necessárias para configurar o cargo no sistema.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void filterForm.handleSubmit(onSubmitFilterForm)(event);
            }}
          >
            <FormField
              control={filterForm.control}
              name="codigo_cargo"
              
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#313131] font-bold">
                    <span className="required">Código e descrição completa do cargo no EOL</span>
                    <Tooltip title="Utilizada no texto oficial da Portaria." placement="right">
                      <InfoCircleOutlined className="ml-2" style={{ color: "#B22B2A" }} />
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    {isLoadingCargos ? (
                      <div className="flex h-10 items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Combobox
                        placeholder="Selecione"
                        data-testid="select-codigo-cargo-eol"
                        value={field.value ?? ""}
                        options={cargosOpcoesCombobox}
                        onChange={field.onChange}
                      />
                    )}
                  </FormControl>
                  <FormMessage showBlankSpace={false} />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-8">
              <Button
                size="lg"
                key="cancelar"
                type="button"
                variant="default"
                data-testid="botao-cancelar-selecao-de-cargo"
                onClick={onClose}
              >
                <span className="font-bold">Cancelar</span>
              </Button>
              <Button
                size="lg"
                key="continuar"
                type="submit"
                variant="destructive"
                data-testid="botao-continuar-selecao-de-cargo"
                disabled={isLoadingCargos}
                loading={filterForm.formState.isSubmitting}
              >
                <span className="font-bold">Continuar</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
