
import { DateRangePickerField, InputField } from '@/components/ui/FieldsForm';
import { FormControl, FormLabel, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../FiltroAcoes/FiltroAcoes';
import { StatusAtosAdministrativos } from '@/types/designacao';
import { StatusPublicacaoSelectField } from './FiltroDeHistoricoDeAtosAdministrativos';

interface Props {
  onClear?: () => void;
}


export const AtosOpcoes = [
  { codigo: 'DESIGNACAO', nome: 'Designação' },
  { codigo: 'CESSACAO', nome: 'Cessação' },
  { codigo: 'INSUBSISTENCIA_DESIGNACAO', nome: 'Insubsistência de Designação' },
  { codigo: 'INSUBSISTENCIA_CESSACAO', nome: 'Insubsistência de Cessação' },
  { codigo: 'APOSTILA_DESIGNACAO', nome: 'Apostila de Designação' },
  { codigo: 'APOSTILA_CESSACAO', nome: 'Apostila de Cessação' },
  { codigo: 'INSUBSISTENCIA_APOSTILA', nome: 'Anulação de Apostila' },
  { codigo: 'INSUBSISTENCIA_INSUBSISTENCIA', nome: 'Tornar sem efeito' },
]


export const StatusPublicacaoOpcoes = [
  { codigo: StatusAtosAdministrativos.NAO_PUBLICADO, nome: 'Aguardando publicação' },
  { codigo: StatusAtosAdministrativos.PUBLICADO, nome: 'Publicado' },
]

export const TipoAtoSelectField: React.FC<{ AtosOpcoes: { codigo: string, nome: string }[] }> = ({ AtosOpcoes }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#313131] font-bold">Tipo</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
              <SelectTrigger data-testid="select-listar-para">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {AtosOpcoes.map((item) => (
                  <SelectItem key={item.codigo} value={item.codigo}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FiltroDeAtosAdministrativos: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();
  const watchedValues = watch([
    "tipo",
    "portaria",
    "numero_sei",
    "nome_titular_e_indicado",
    "status_publicacao",
    "periodo",
    "numero_sei",
    "rf",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);

  return (
    <>
      <p className="text-[20px] font-bold pt-1 pb-1">Filtros</p>
      <p className="text-[14px] font-normal pt-1 pb-8">Selecione os campos para buscar as portarias disponíveis.</p>

      <div className="w-full flex gap-4">
        <div className="w-[33%]">
          <TipoAtoSelectField AtosOpcoes={AtosOpcoes} />

        </div>
        <div className="w-[34%]">
          <InputField
            register={register}
            control={control}
            name="numero_sei"
            label="Nº SEI"
            placeholder="1234.5678/9012345-6"
            data-testid="input-numero_sei"
            type="string"
            mask="9999.9999/9999999-9"
          />
        </div>
        <div className="w-[33%]">
          <DateRangePickerField
            register={register}
            control={control}
            name="periodo"
            label="Período"
            placeholder="Selecione um período"
          />
        </div>


      </div>

      <div className="w-full flex gap-4">
        <div className="w-[50%]">
          <InputField
            register={register}
            control={control}
            name="portaria"
            label="Portaria de designação"
            placeholder="0000/2026"
            data-testid="input-portaria"
            type="text"
          />

        </div>
        <div className="w-[50%]">
          <InputField
            register={register}
            control={control}
            name="nome_titular_e_indicado"
            label="Servidor"
            placeholder="Exemplo: João da Silva"
            data-testid="input-nome-titular-e-indicado"
            type="text"
          />

        </div>

      </div>
      <div className="w-full flex gap-4">

        <div className="w-[50%]">
          <InputField
            register={register}
            control={control}
            name="rf"
            label="Registro Funcional (RF)"
            placeholder="Entre com o RF"
            data-testid="input-rf"
            type="number"
          />
        </div>
        <div className="w-[50%]">
        <StatusPublicacaoSelectField StatusPublicacaoOpcoes={StatusPublicacaoOpcoes} />
        </div>
      </div>

      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} />
    </>
  );
};

export default FiltroDeAtosAdministrativos;