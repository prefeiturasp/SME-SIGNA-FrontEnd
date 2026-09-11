
import { InputField, SelectField } from '@/components/ui/FieldsForm';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../../Designacao/FiltroAcoes/FiltroAcoes';

interface Props {
  onClear?: () => void;
}

export const SituacaoFuncionalOpcoes = [
  { codigo: 'COMISSIONADO', nome: 'Cargo em comissão' },
  { codigo: 'EFETIVO', nome: 'Efetivo' },
  { codigo: 'CONTRATADO', nome: 'Contratado' }
]

export const StatusOpcoes = [
  { codigo: 'ATIVO', nome: 'Ativo' },
  { codigo: 'INATIVO', nome: 'Inativo' },
  { codigo: 'EXTINTO', nome: 'Extinto' },
]
export const CargosBaseGrupamento = [
  { codigo: 'APOIO_EDUCACAO', nome: 'Apoio - educação' },
  { codigo: 'DOCENTES', nome: 'Docentes' },
  { codigo: 'GESTORES_EDUCACAO', nome: 'Gestores - educação' },
]

const FiltroDeCargosBase: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();
  const watchedValues = watch([
    "grupamento",
    "descricao_resumida",
    "descricao_completa",
    "situacao_funcional",
    "status",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);

  return (
    <>
      <div className="w-full flex gap-4">
        
        <div className="w-[50%]">
          <SelectField
            register={register}   
            control={control}
            name="grupamento"
            label="Grupamento"
            placeholder="Selecione"
            data-testid="input-grupamento"
            options={CargosBaseGrupamento.map((item) => ({
              value: item.codigo,
              label: item.nome,
            }))}
          />
        </div>
        <div className="w-[50%]">
        <InputField
            register={register}
            control={control}
            name="descricao_resumida"
            label="Descrição Resumida"
            placeholder="Digite ..."
            data-testid="input-descricao_resumida"
            type="text"
          />
        </div>


      </div>

      <div className="w-full flex gap-4">
        <div className="w-[33%]">
          <InputField
            register={register}
            control={control}
            name="descricao_completa"
            label="Descrição Completa"
            placeholder="Digite ..."
            data-testid="input-descricao_completa"
            type="text"
          />

        </div>
        <div className="w-[34%]">
          <SelectField
            register={register}
            control={control}
            name="situacao_funcional"
            label="Situação Funcional"
            placeholder="Selecione"
            data-testid="input-situacao_funcional"
            options={SituacaoFuncionalOpcoes.map((item) => ({
              value: item.codigo,
              label: item.nome,
            }))}
          />

        </div>
        <div className="w-[33%]">
          <SelectField
            register={register}
            control={control}
            name="status" 
            label="Status"
            placeholder="Selecione"
            data-testid="input-status"
            options={StatusOpcoes.map((item) => ({
              value: item.codigo,
              label: item.nome,
            }))}
          />

        </div>

      </div>
    

      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} />
    </>
  );
};

export default FiltroDeCargosBase;