
import { DateField, InputField } from '@/components/ui/FieldsForm';
import { Input, Radio, RadioChangeEvent } from 'antd';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';


type OptionRadioCardProps = {
  checked: boolean;
  title: string;
  description: string;
  onChange: () => void;
};

function OptionRadioCard({
  checked,
  title,
  description,
  onChange,
}: OptionRadioCardProps) {
  return (
    <div className="rounded-lg border border-[#DCDCDC] p-4">
      <Radio checked={checked} onChange={onChange} className="radio-do-option">
        <div>
          <p className="text-[14px] font-bold">{title}</p>

          <p className="text-[14px] font-normal text-[#9CA3B9]">
            {description}
          </p>
        </div>
      </Radio>
    </div>
  );
}

interface Props {
  onClear?: () => void;
}

const MainDOForm: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();




  const [value, setValue] = useState(1);

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };


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
            name="numero_sei"
            label="Data da publicação no Diário Oficial (D.O)"
            placeholder="Selecione a data"
            data-testid="input-data-publicacao"
            type="date"
          />
        </div>

      </div>

      <p className="text-[20px] font-bold pt-8 pb-1">Filtrar portarias</p>
      <p className="text-[14px] font-normal pt-1 pb-4">Defina quais portarias selecionadas devem ter a data alterada.</p>


      <div className="w-full flex gap-4">
        <div className="w-[100%] flex flex-col gap-2">
          <OptionRadioCard
            checked={value === 1}
            onChange={() => setValue(1)}
            title="Portarias sem data e portarias com data específica"
            description="Inclui registros vazios e também aqueles com uma data específica"
          />
          <OptionRadioCard
            checked={value === 2}
            onChange={() => setValue(2)}
            title="Portarias sem data e portarias com data específica"
            description="Inclui registros vazios e também aqueles com uma data específica"
          />
        </div>
      </div>

    </>
  );
};

export default MainDOForm;