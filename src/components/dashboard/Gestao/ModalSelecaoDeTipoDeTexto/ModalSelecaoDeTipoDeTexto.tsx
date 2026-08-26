"use client";
import { Button } from "@/components/ui/button";


import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CheckboxFieldSecondary } from "@/components/ui/FieldsForm";
import { AtosOpcoes, TipoAtoSelectField } from "../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos";
import { useModalTextosPortaria } from "@/hooks/useModalTextosPortaria";
import { FormProvider } from "react-hook-form";

const fields: { label: string; subtitle: string; value: string }[] =
[
  {
    label: "Criar um novo texto",
    subtitle: "Inicia o cadastro com os campos em branco.",
    value: "criar_novo_texto",
  },
  {
    label: "Usar o último texto cadastrado",
    subtitle: "Preenche os campos com base no último texto criado. As informações poderão ser editadas antes de salvar.",
    value: "ultimo_texto_cadastrado",
  },
]


interface ModalSelecaoDeTipoDeTextoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSelecaoDeTipoDeTexto({ isOpen, onClose }: ModalSelecaoDeTipoDeTextoProps) {

  const { filterForm, onSubmitFilterForm, tipo_de_texto, isPending } = useModalTextosPortaria();
 

  return (
    <FormProvider {...filterForm}>
      <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
        <Dialog open={isOpen}>
          <DialogContent className="max-w-[560px] p-8 overflow-y-auto max-h-[90vh]" closeButton={false}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-[20px] font-bold">Novo texto de portaria</DialogTitle>
              <DialogDescription className="text-sm text-black">
                Escolha como deseja criar o texto da portaria.
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-black">Você pode iniciar um novo texto ou utilizar como base o último texto cadastrado para o ato administrativo selecionado.</p>

            <CheckboxFieldSecondary
              register={filterForm.register}
              control={filterForm.control}
              name="tipo_de_texto"
              dataTestId="tipo-texto-portaria"
              showBlankSpace={false}
              fields={fields}
              label="Tipo de texto"
            />

            {tipo_de_texto === "ultimo_texto_cadastrado" && (
              <div className="pl-8">
                <TipoAtoSelectField
                  label={"Tipo de portaria"}
                  name="tipo_portaria"
                  AtosOpcoes={AtosOpcoes}
                />
              </div>
            )
            }
            <div className="flex justify-end gap-2">
              <Button
                size="lg"
                key="cancelar"
                variant="default"
                data-testid="botao-cancelar-revisar-texto"
                onClick={onClose}
              >
                <span className="font-bold">Cancelar</span>
              </Button>
              <Button
                size="lg"
                key="criar-texto"
                variant="destructive"
                data-testid="botao-criar-texto"
                onClick={filterForm.handleSubmit(onSubmitFilterForm)}
                disabled={isPending}
                loading={isPending}
              >
                <span className="font-bold">Criar texto</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </form>
    </FormProvider >

  );
}
