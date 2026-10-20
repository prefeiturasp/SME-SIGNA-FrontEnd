
import { DateRangePickerField, InputField, SelectField } from '@/components/ui/FieldsForm';
import { FormControl, FormLabel, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../FiltroAcoes/FiltroAcoes';
import { AtosOpcoes, StatusPublicacaoOpcoes, TipoAtoSelectField } from './FiltroDeAtosAdministrativos';

interface Props {
  onClear?: () => void;
}

export const CargoSelectField: React.FC<{ CargoOpcoes: { codigo: string, nome: string }[] }> = ({ CargoOpcoes }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="cargo"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#313131] font-bold">Cargo</FormLabel>
          <FormControl>

            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
              <SelectTrigger data-testid="select-cargo">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CargoOpcoes.map((item) => (
                  <SelectItem key={item.codigo} value={item.codigo}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
              <p className="text-[12px] text-[#9CA3B9] font-normal pt-0 pb-8">O número entre parênteses indica a quantidade de atos registrados para cada cargo.</p>
            </Select>
          </FormControl>
          <FormMessage />

        </FormItem>
      )}
    />
  );
};

export const StatusPublicacaoSelectField: React.FC<{ StatusPublicacaoOpcoes: { codigo: string, nome: string }[] }> = ({ StatusPublicacaoOpcoes }) => {
  const { control } = useFormContext();

  return (
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
  );
};


const FiltroDeHistoricoDeAtosAdministrativos: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();
  const watchedValues = watch([
    "tipo",
    "periodo",
    "observacao",
    "status_publicacao",
    "cargo",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);
  const CargoOpcoes = [
    { value: 'TODOS', label: 'Todos os cargos' },
    { value: '1', label: 'Cargo 1' },
    { value: '2', label: 'Cargo 2' },
    { value: '3', label: 'Cargo 3' },
  ]
  return (
    <>
      <p className="text-[20px] font-bold pt-1 pb-1">Filtros</p>
      <p className="text-[14px] font-normal pt-1 pb-8">Utilize os filtros para refinar a sua busca.</p>

      <div className="w-full grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <TipoAtoSelectField label="Tipo de ato administrativo" AtosOpcoes={[{ codigo: 'TODOS', nome: 'Todos os atos' }, ...AtosOpcoes]} />
        </div>
        <div className="col-span-1">
          <DateRangePickerField
            register={register}
            control={control}
            name="periodo"
            label="Período"
            placeholder="Selecione um período"
          />
        </div>

        <div className="col-span-1">
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
      </div>

      <div className="w-full grid grid-cols-2 gap-4">

        <div >
        <SelectField
            register={register}
            control={control}
            name="status_publicacao"
            label="Status"
            placeholder="Selecione"
            data-testid="select-status-publicacao"
            options={StatusPublicacaoOpcoes}
            showBlankSpace={false}
            disabled={false}           
          />
        </div>
        <div >
          <SelectField
            register={register}
            control={control}
            name="cargo"
            label="Cargo"
            placeholder="Selecione"
            data-testid="select-codigo-cargo-eol"
            options={CargoOpcoes}
            showBlankSpace={false}
            disabled={false}
            extraContent={<p className="text-[12px] text-[#9CA3B9] font-normal p-0">O número entre parênteses indica a quantidade de atos registrados para cada cargo.</p>}
          />
        </div>

      </div>


      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} />
    </>
  );
};

export default FiltroDeHistoricoDeAtosAdministrativos;