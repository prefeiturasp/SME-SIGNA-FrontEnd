"use client";

import { useFormContext, useWatch } from "react-hook-form";

 

import { InputField } from "@/components/ui/FieldsForm";
import { InfoItem } from "@/components/ui/info-item";
import { Button } from "@/components/ui/button";
import Eye from "@/assets/icons/Eye";
import { memo, useState } from "react";
import ModalListaCursosTitulos from "../ModalListaCursosTitulo/ModalListaCursosTitulos";




const CamposEditarServidor = (

) => {

  const { register, control } = useFormContext();
  const [
    nomeServidor,
    rf,
    vinculo,
    cargoBase,
    lotacao,
    cursosTitulos,
    cargoSobreposto,
    localExercicio,
    laudoMedico,
    cdCargoBase,
    categoria,
  ] = useWatch({
    control,
    name: [
      "nome_servidor",
      "rf",
      "vinculo",
      "cargo_base",
      "lotacao",
      "cursos_titulos",
      "cargo_sobreposto_funcao_atividade",
      "local_de_exercicio",
      "laudo_medico",
      "cd_cargo_base",
      "categoria",
    ],
  });
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
            value={rf ?? '-'}
          />
        </div>

         
        <div className="w-full">
        <InfoItem
            label="Vínculo"
            value={vinculo ?? '-'}
          />
        </div>

      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 pt-2 pb-4" >

        <div className="w-full">
        <InfoItem
            label="Cargo base"
            value={cargoBase ?? '-'}
          />
             
        </div>

      
        <div className="w-full">
        <InfoItem
            label="Lotação"
            value={lotacao ?? '-'}
          />
        </div>
        <div className="w-full">

          <InfoItem
            label="Cursos/Títulos"
            value={cursosTitulos ?? 'Cursos/Títulos de exemplo'}
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
            value={cargoSobreposto ?? '-'}
          />
         
        </div>

        <div className="w-full">
          <InfoItem
            label="Local de exercício"
            value={localExercicio ?? '-'}
          />
         
        </div>

        <div className="w-full">
          <InfoItem
            label="Laudo médico"
            value={laudoMedico ?? '-'}
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
          nome_servidor: nomeServidor,
          rf,
          cargo_sobreposto_funcao_atividade: cargoSobreposto,
          vinculo,
          lotacao,
          cd_cargo_base: cdCargoBase,
          cargo_base: cargoBase,
          categoria,
          cursos_titulos: cursosTitulos,
          local_de_exercicio: localExercicio,
          laudo_medico: laudoMedico,
          cd_cargo_sobreposto_funcao_atividade:1,     
          local_de_servico: "-",
        }}
      />
    </>
  );
};

export default memo(CamposEditarServidor);
