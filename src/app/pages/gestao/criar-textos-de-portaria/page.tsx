"use client";

import { useEffect, useRef } from "react";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import SimpleTableHeader from "@/components/dashboard/SimpleTableHeader/SimpleTableHeader";
import { Alert } from "antd";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import FormCriarTextosPortaria from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormCriarTextosPortaria";


import { SimpleEditor } from "@/components/ui/tiptap-templates/simple/simple-editor";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCriarTextosPortaria } from "@/hooks/useCriarTextosPortaria";





const criarVariavelToken = (variable: string) => `[[${variable}]]`;

const adicionarVariavelToken = (conteudo: string, variable: string) => {
  const token = criarVariavelToken(variable);

  if (conteudo.includes(token)) {
    return conteudo;
  }

  const conteudoSemEspacos = conteudo.trimEnd();

  if (conteudoSemEspacos.toLowerCase().endsWith("</p>")) {
    const conteudoSemParagrafoFechado = conteudoSemEspacos
      .slice(0, -4)
      .trimEnd();
    const separador = conteudoSemParagrafoFechado.endsWith(">") ? "" : " ";

    return `${conteudoSemParagrafoFechado}${separador}${token}</p>`;
  }

  const separador = conteudo.trim() ? " " : "";

  return `${conteudo}${separador}${token}`;
};

const removerVariavelToken = (conteudo: string, variable: string) => {
  const token = criarVariavelToken(variable);

  return conteudo.replaceAll(` ${token}`, "").replaceAll(token, "");
};

const sincronizarVariaveisTokens = (
  conteudo: string,
  variaveisAdicionadas: string[],
  variaveisRemovidas: string[]
) => {
  let nextContent = conteudo;

  variaveisRemovidas.forEach((variable) => {
    nextContent = removerVariavelToken(nextContent, variable);
  });

  variaveisAdicionadas.forEach((variable) => {
    nextContent = adicionarVariavelToken(nextContent, variable);
  });

  return nextContent;
};

export default function CriarTextosDePortaria() {


  const {
    filterForm,
    isModalOpen,
    variaveisOpcoes,
    onSubmitFilterForm,
    handleCancel
  } = useCriarTextosPortaria();


  const router = useRouter();
  const watchedVariables = filterForm.watch("variavel");
  const selectedVariablesKey = Array.isArray(watchedVariables)
    ? watchedVariables.join("|")
    : "";
  const previousVariablesRef = useRef<string[]>(
    Array.isArray(watchedVariables) ? watchedVariables : []
  );

  useEffect(() => {
    const currentVariables = selectedVariablesKey ? selectedVariablesKey.split("|") : [];
    const previousVariables = previousVariablesRef.current;
    const variaveisAdicionadas = currentVariables.filter(
      (variable) => !previousVariables.includes(variable)
    );
    const variaveisRemovidas = previousVariables.filter(
      (variable) => !currentVariables.includes(variable)
    );

    if (!variaveisAdicionadas.length && !variaveisRemovidas.length) {
      return;
    }

    const currentContent = filterForm.getValues("texto_portaria") ?? "";
    const nextContent = sincronizarVariaveisTokens(
      currentContent,
      variaveisAdicionadas,
      variaveisRemovidas
    );

    if (nextContent !== currentContent) {
      filterForm.setValue("texto_portaria", nextContent, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    previousVariablesRef.current = currentVariables;
  }, [filterForm, selectedVariablesKey]);

  return (
    <FormProvider {...filterForm}>
      <PageHeader
        showBackButton={false}
        title={
          "Cadastrar texto de portaria"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Textos de portaria", href: "textos-de-portaria" },
          { title: "Cadastrar texto de portaria", href: "" },
        ]}
        createButton={
          <>
            <Button
              size="lg"
              type="button"
              variant="default"
              className="gap-2"
              onClick={() => router.push("/pages/gestao/textos-de-portaria")}
              data-testid="btn-voltar"
            >
              <span className="font-bold">Cancelar</span>
            </Button>

            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              variant="destructive"
              data-testid="botao-proximo"
              onClick={filterForm.handleSubmit(onSubmitFilterForm)}
            >
              Cadastrar texto
            </Button>
          </>
        }
      />

      <FundoBranco className="mb-4 mt-8">
        <SimpleTableHeader
          title="Informações gerais"
          subtitle="Preencha as informações do modelo e o texto que será utilizado na emissão da portaria."
        />

        <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
          <FormCriarTextosPortaria variaveisOpcoes={variaveisOpcoes} />
        </form>

      </ FundoBranco>


      <FundoBranco className="mb-4 mt-8">
        <SimpleTableHeader
          title="Texto da portaria"
          subtitle="Digite o texto da portaria e utilize as ferramentas de formatação para organizar o conteúdo."
        />

        <Alert
          title={<span className="font-bold text-[14px] ">Atenção ao editar o texto!</span>}
          description="Os campos entre colchetes, como por exemplo: [[Nome do servidor]], funcionam como espaços reservados que serão preenchidos automaticamente pelo sistema. Ao editar o texto, mantenha esses campos sem alterações para garantir que as informações corretas sejam inseridas na emissão de uma nova portaria."
          type="warning"
          showIcon
          icon={<TriangleAlert style={{ color: "#B7A100" }} className="w-[20px] h-[20px]" />}
        />


        <div className="mb-2 mt-4">
          <FormField
            {...filterForm.register('texto_portaria')}
            control={filterForm.control}
            name="texto_portaria"

            render={({ field, fieldState }) => (
              <FormItem >
                <FormLabel className="required text-[#313131] font-bold">
                  Texto da portaria*
                </FormLabel>
                <FormControl>
                  <SimpleEditor
                    hasError={!!fieldState.error}
                    onChange={field.onChange}
                    content={field.value}
                  />
                </FormControl>
                <FormMessage showBlankSpace />
              </FormItem>
            )}
          />

        </div>
      </FundoBranco>

      <Dialog open={isModalOpen}>
        <DialogContent className="max-w-[560px] p-8 overflow-y-auto max-h-[90vh]" closeButton={false}>
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold">Revise as variáveis do texto</DialogTitle>
            <DialogDescription className="sr-only">
              Modal com a Revise as variáveis do texto.
            </DialogDescription>
          </DialogHeader>

          <p>Algumas variáveis estão diferentes do formato esperado e podem impedir o preenchimento automático das informações na portaria.</p>
          <p>Por favor, volte ao texto e verifique se todas as variáveis estão no formato <b>“[[nome da variável]]”</b>.</p>

          <div className="flex justify-end mt-4">
            <Button
              size="lg"
              key="back"
              variant="destructive"
              data-testid="botao-cancelar-revisar-texto"
              onClick={handleCancel}
            >
              <span className="font-bold">Revisar texto</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>      
    </FormProvider>

  );
}
