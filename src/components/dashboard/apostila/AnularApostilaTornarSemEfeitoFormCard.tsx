"use client";

import { Card } from "antd";
import { ComponentProps } from "react";
import { FieldValues, Path, SubmitHandler, UseFormReturn, FormProvider } from "react-hook-form";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import BlocosDesignacao from "@/components/dashboard/Designacao/ResumoDesignacao/BlocosDesignacao";
import EditorSEI from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import PortariaAnularApostilaFields from "@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields";

type BlocosDesignacaoProps = ComponentProps<typeof BlocosDesignacao>;

type AnularApostilaTornarSemEfeitoFormCardProps<TFieldValues extends FieldValues> = Readonly<{
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  tipoPortaria: "designacao" | "cessacao";
  dadosIndicado: BlocosDesignacaoProps["dadosIndicado"];
  dadosPortaria: BlocosDesignacaoProps["dadosPortaria"];
  dadosPortariaCessacao: BlocosDesignacaoProps["dadosPortariaCessacao"];
  triggerField: Path<TFieldValues>;
  onGerarPortaria: () => void;
  mostrarEditor: boolean;
  htmlPortaria: string;
  showTextoParaApostila?: boolean;  
  tituloForm: string;
}>;

export default function AnularApostilaTornarSemEfeitoFormCard<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  tipoPortaria,
  dadosIndicado,
  dadosPortaria,
  dadosPortariaCessacao,
  triggerField,
  onGerarPortaria,
  mostrarEditor,
  htmlPortaria,
  showTextoParaApostila,
  tituloForm,
}: AnularApostilaTornarSemEfeitoFormCardProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card
          className="mt-4"
          title={
            <div className="flex justify-between items-center">
              <span className="text-[#333]">{tipoPortaria === "designacao" ? "Designação" : "Cessação"}</span>
            </div>
          }
        >
          <Accordion
            type="multiple"
            defaultValue={["servidor-indicado", "portaria-designacao", "portarias-cessacao", "portaria-apostila"]}
          >
            <BlocosDesignacao
              dadosIndicado={dadosIndicado}
              dadosPortaria={dadosPortaria}
              dadosPortariaCessacao={dadosPortariaCessacao}
              onSubmitEditarServidor={() => {}}
              showExtraFields
              showCursosTitulos
              showLotacao
              showCategoria={false}
              showCessacao={dadosPortariaCessacao}
              showCessacaoExtraFields
            />

            <CustomAccordionItem title={tituloForm} value="portaria-apostila" color="blue">
              <PortariaAnularApostilaFields
                tipo_portaria={tipoPortaria}
                showTextoParaApostila={showTextoParaApostila}
              />
              <div className="w-full flex justify-end pt-[2rem]">
                <div className="w-[200px]">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full flex items-center justify-center gap-6"
                    variant="destructive"
                    onClick={async () => {
                      const isValid = await form.trigger(triggerField);
                      if (!isValid) return;
                      onGerarPortaria();
                    }}
                  >
                    Gerar texto SEI
                  </Button>
                </div>
              </div>
            </CustomAccordionItem>
          </Accordion>

          {mostrarEditor && (
            <EditorSEI
              html={htmlPortaria}
              titulo="TEXTO"
              labelBotao="Salvar"
              tipoBotao="submit"
              testId="botao-proximo"
            />
          )}
        </Card>
      </form>
    </FormProvider>
  );
}
