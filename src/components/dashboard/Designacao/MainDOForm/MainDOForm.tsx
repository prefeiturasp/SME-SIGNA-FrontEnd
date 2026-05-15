
import { DateField } from '@/components/ui/FieldsForm';
import { Radio } from 'antd';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';


type OptionRadioCardProps = {
  checked: boolean;
  optionValue: number;
  title: string;
  description: string;
  onChange: () => void;
};
export const PORTARIAS_SEM_DATA_DE_PUBLICACAO = 1;
export const PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA = 2;

function OptionRadioCard({
  checked,
  optionValue,
  title,
  description,
  onChange,
}: OptionRadioCardProps) {
  const { register, control } = useFormContext();

  return (
    <div
      className="rounded-lg border border-[#DCDCDC] p-4"
      role="button"
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(); }}
    >
      <Radio checked={checked} className="radio-do-option">
        <div>
          <p className="text-[14px] font-bold">{title}</p>

          <p className="text-[14px] font-normal text-[#9CA3B9]">
            {description}
          </p>
          {optionValue === PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA && checked && (
            <div className="mt-4 w-[100%] flex flex-col gap-2">
              <DateField
                register={register}
                control={control}
                name="data_considerada_portaria"
                label="Considerar também portarias com a data"
                placeholder="Selecione a data"
                data-testid="input-data-considerada-portaria"
                type="date"
              />
            </div>
          )}
        </div>
      </Radio>
    </div>
  );
}

interface Props {
  onClear?: () => void;
}

const MainDOForm: React.FC<Props> = ({ onClear }) => {
  const { register, control } = useFormContext();





  return (
    <>

      <div className="w-full flex gap-4 bg-[#F1F5F9] p-4 rounded-lg">
        <div className="w-[50%]">
          <p className="text-[20px] font-bold pt-1 pb-1">Data de publicação</p>
          <p className="text-[14px] font-normal pt-1 pb-1">A data será aplicada às portarias que se enquadrarem nos filtros.</p>

        </div>

        <div className="w-[50%]">
          <DateField
            register={register}
            control={control}
            name="data_publicacao"
            label="Data da publicação no Diário Oficial (D.O)"
            placeholder="Selecione a data"
            data-testid="input-data-publicacao"
            type="date"
          />
        </div>

      </div>

      <p className="text-[20px] font-bold pt-8 pb-1">Filtrar portarias</p>
      <p className="text-[14px] font-normal pt-1 pb-4">Defina quais portarias selecionadas devem ter a data alterada.</p>


      <Controller
        name="portarias_selecionadas"
        control={control}
        render={({ field }) => (
          <div className="w-full flex gap-4">
            <div className="w-[100%] flex flex-col gap-2">
              <OptionRadioCard
                checked={field.value === PORTARIAS_SEM_DATA_DE_PUBLICACAO}
                optionValue={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
                onChange={() => field.onChange(PORTARIAS_SEM_DATA_DE_PUBLICACAO)}
                title="Somente portarias sem data de publicação"
                description="Inclui apenas registros com campo vazio."
              />
              <OptionRadioCard
                checked={field.value === PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA}
                optionValue={PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA}
                onChange={() => field.onChange(PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA)}
                title="Portarias sem data e portarias com data específica"
                description="Inclui registros vazios e também aqueles com uma data específica"
              />
            </div>
          </div>
        )}
      />

    </>
  );
};

export default MainDOForm;