"use client";

import { useFormContext } from "react-hook-form";

 

import { InputField } from "@/components/ui/FieldsForm";
import { InfoItem } from "@/components/ui/info-item";
import { Button } from "@/components/ui/button";
import Eye from "@/assets/icons/Eye";
import { useState } from "react";
import ModalListaCursosTitulos from "../ModalListaCursosTitulo/ModalListaCursosTitulos";




const CamposEditarServidor = (

) => {

  const { register, control, watch } = useFormContext();
  const [openModalListaCursosTitulos, setOpenModalListaCursosTitulos] = useState(false);

  function handleOpenModalListaCursosTitulos() {
    setOpenModalListaCursosTitulos(!openModalListaCursosTitulos);
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 " >
        <div className="w-full">
          <InputField
            register={register}
            control={control}
            name="nome_servidor"
            label="Nome servidor"
            placeholder="Digite o nome do servidor"
            data-testid="input-nome-servidor"
          />
        </div>
        <div className="w-full">
          <InputField
            register={register}
            control={control}
            name="nome_civil"
            label="Nome Social"
            placeholder="Digite o nome social"
            data-testid="input-nome-civil"
          />
        </div>
        <div className="w-full">
        <InfoItem
            label="RF"  
            value={watch("rf") ?? '-'}
          />
        </div>

         
        <div className="w-full">
        <InfoItem
            label="Vínculo"
            value={watch("vinculo") ?? '-'}
          />
        </div>

      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 pt-2 pb-4" >

        <div className="w-full">
        <InfoItem
            label="Cargo base"
            value={watch("cargo_base") ?? '-'}
          />
             
        </div>

      
        <div className="w-full">
        <InfoItem
            label="Lotação"
            value={watch("lotacao") ?? '-'}
          />
        </div>
        <div className="w-full">

          <InfoItem
            label="Cursos/Títulos"
            value={watch("cursos_titulos") ?? 'Cursos/Títulos de exemplo'}
            icon={
              <Button
                type="button"
                data-testid="btn-visualizar-cursos-titulos"
                variant="ghost"
                size="icon"
                onClick={handleOpenModalListaCursosTitulos}>
                <Eye
                  width={16}
                  height={16}
                  className='fill-[#6058A2]'
                />
              </Button>
            }
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 " >

        <div className="w-full">
          <InfoItem
            label="Cargo sobreposto/Função atividade"
            value={watch("cargo_sobreposto_funcao_atividade") ?? '-'}
          />
         
        </div>

        <div className="w-full">
          <InfoItem
            label="Local de exercício"
            value={watch("local_de_exercicio") ?? '-'}
          />
         
        </div>

        <div className="w-full">
          <InfoItem
            label="Laudo médico"
            value={watch("laudo_medico") ?? '-'}
          />
         
        </div>

      </div>

      <ModalListaCursosTitulos
        isLoading={false}
        open={openModalListaCursosTitulos}
        onOpenChange={setOpenModalListaCursosTitulos}
        //to-do: remover mock quando conectar com api que recebera dados do EOL
        data={[{ id: 1, concurso: '201002757777 - PROF ENS FUND II MEDIO' }, { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" }]}
        defaultValues={{  
          nome_servidor: watch("nome_servidor"),
          rf: watch("rf"),
          cargo_sobreposto_funcao_atividade: watch("cargo_sobreposto_funcao_atividade"),
          vinculo: watch("vinculo"),
          lotacao: watch("lotacao"),
          cd_cargo_base: watch("cd_cargo_base"),
          cargo_base: watch("cargo_base"),
          categoria: watch("categoria"),
          cursos_titulos: watch("cursos_titulos"),
          local_de_exercicio: watch("local_de_exercicio"),
          laudo_medico: watch("laudo_medico"),
          cd_cargo_sobreposto_funcao_atividade:1,     
          local_de_servico: "-",
        }}
      />

    </>


  );
};

export default CamposEditarServidor;
