
import { DateRangePickerField, InputField } from '@/components/ui/FieldsForm';
import { FormControl, FormLabel, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../FiltroAcoes/FiltroAcoes';
import { AtosOpcoes, StatusPublicacaoOpcoes } from './FiltroDeAtosAdministrativos';

interface Props {
  onClear?: () => void;
}


const FiltroDeHistoricoDeAtosAdministrativos: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();
  const watchedValues = watch([
    "tipo",
    "periodo",
    "observacao",
    "status_publicacao",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);

  return (
    <>
      <p className="text-[20px] font-bold pt-1 pb-1">Filtros</p>
      <p className="text-[14px] font-normal pt-1 pb-8">Utilize os filtros para refinar a sua busca.</p>

      <div className="w-full flex gap-4">
        <div className="w-[25%]">
          <FormField
            control={control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#313131] font-bold">Tipo</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger data-testid="select-listar-para">
                      <SelectValue placeholder="Todos" />
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

        </div>
        <div className="w-[25%]">
          <DateRangePickerField
            register={register}
            control={control}
            name="periodo"
            label="Período"
            placeholder="Selecione um período"
          />
        </div>

        <div className="w-[25%]">
          <InputField
            register={register}
            control={control}
            name="observacao"
            label="Buscar por observações"
            placeholder="Digite ..."
            data-testid="input-observacao"
            type="string"
          />
        </div>

        <div className="w-[25%]">

          <FormField
            control={control}
            name="status_publicacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#313131] font-bold">Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger data-testid="select-status-publicacao">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {StatusPublicacaoOpcoes.map((item) => (
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
        </div>

      </div>
 

      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} />
    </>
  );
};

export default FiltroDeHistoricoDeAtosAdministrativos;