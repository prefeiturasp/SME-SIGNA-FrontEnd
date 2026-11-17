"use client";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/FieldsForm";
import { useModalSelecaoDeCargo } from "@/hooks/useModalSelecaoDeCargo";
import { FormProvider } from "react-hook-form";
import { InfoCircleOutlined } from "@ant-design/icons";
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

  return (
    <FormProvider {...filterForm}>
      <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
        <Dialog open={isOpen}>
          <DialogContent className="max-w-[560px] p-8 overflow-y-auto max-h-[90vh]" closeButton={false}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-[20px] font-bold">Selecione um cargo</DialogTitle>
              <DialogDescription className="text-sm text-black">
                Após a seleção, você poderá cadastrar as informações complementares necessárias para configurar o cargo no sistema.
              </DialogDescription>
            </DialogHeader>

            <SelectField
              register={filterForm.register}
              control={filterForm.control}
              name="codigo_cargo"
              label={<>
                <span className='required'>Código e descrição completa do cargo no EOL</span>
                <Tooltip title="Utilizada no texto oficial da Portaria." placement="right">
                  <InfoCircleOutlined className='ml-2' style={{ color: "#B22B2A" }} />
                </Tooltip>
              </>}
              placeholder="Selecione"
              data-testid="select-codigo-cargo-eol"
              dataTestId="select-codigo-cargo-eol"
              isLoading={isLoadingCargos}
              options={cargosOpcoes.map((cargo: ICargoType) => ({
                value: String(cargo.codigoCargo),
                label: cargo.nomeCargo,
              }))}
            />

            <div className="flex justify-end gap-2">
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
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
}
