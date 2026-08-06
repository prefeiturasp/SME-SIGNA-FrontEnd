
import { InputField, SelectField } from '@/components/ui/FieldsForm';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../../Designacao/FiltroAcoes/FiltroAcoes';

interface Props {
  onClear?: () => void;
}

export const SituacaoFuncionalOpcoes = [
  { codigo: '1', nome: 'Cargo em comissão' },
  { codigo: '2', nome: 'Efetivo' },
  { codigo: '3', nome: 'Contratado' }
]

export const StatusOpcoes = [
  { codigo: '1', nome: 'Ativo' },
  { codigo: '2', nome: 'Inativo' },
  { codigo: '3', nome: 'Extinto' },
]
export const CargosBaseGrupamento = [
  { codigo: '1', nome: 'Apoio - educação' },
  { codigo: '2', nome: 'Docentes' },
  { codigo: '3', nome: 'Gestores - educação' },
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