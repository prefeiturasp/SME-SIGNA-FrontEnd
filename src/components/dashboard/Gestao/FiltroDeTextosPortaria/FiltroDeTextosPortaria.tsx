
import { InputField, SelectField } from '@/components/ui/FieldsForm';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../../Designacao/FiltroAcoes/FiltroAcoes';
import { AtosOpcoes, TipoAtoSelectField } from '../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos';

interface Props {
  onClear?: () => void;
} 

export const StatusOpcoes = [
  { codigo: 'ATIVO', nome: 'Ativo' },
  { codigo: 'INATIVO', nome: 'Inativo' },
]
 
const FiltroDeTextosPortaria: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();
  const watchedValues = watch([
    "tipo",
    "nome_do_modelo",
    "status",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);

  return (
    <>
    <div className="w-full flex gap-4">
        <div className="w-[33%]">
          <TipoAtoSelectField label={"Tipo de portaria"} AtosOpcoes={AtosOpcoes} />
        </div>
        <div className="w-[34%]">
          <InputField
            register={register}
            control={control}
            name="nome_do_modelo"
            label="Nome do Modelo"
            placeholder="Digite o nome do modelo..."
            data-testid="input-nome_do_modelo"
            type="text"
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

export default FiltroDeTextosPortaria;