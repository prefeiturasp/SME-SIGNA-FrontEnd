
import { InputField } from '@/components/ui/FieldsForm';
import { FormControl, FormLabel, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../FiltroAcoes/FiltroAcoes';

interface Props {
  onClear?: () => void;
}

const FiltroDeDo: React.FC<Props> = ({ onClear }) => {
  const { register, control, watch } = useFormContext();



  const watchedValues = watch([
    "numero_sei",
    "portaria_inicial",
    "portaria_final",
    "ano",
    "tipo"
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);


  const listarParaOpcoes = [{
    codigo: 'DESIGNACAO_CESSACAO',
    nome: 'Cargos (Designação / Cessação)',
  }]

  const anos =  [{codigo: new Date().getFullYear().toString(), nome: new Date().getFullYear().toString()}]
  return (
    <>
      <p className="text-[20px] font-bold pt-1 pb-1">Filtros</p>
      <p className="text-[14px] font-normal pt-1 pb-8">Selecione os campos para buscar as portarias disponíveis.</p>


      <div className="w-full flex gap-4">
        <div className="w-[33%]">
          <InputField
            register={register}
            control={control}
            name="numero_sei"
            label="Nº SEI da lauda definitiva"
            placeholder="0000.0000/0000000-0"
            mask="9999.9999/9999999-9"
            data-testid="input-numero_sei"
            type="string"
          />
        </div>
        <div className="w-[34%]">
          <InputField
            register={register}
            control={control}
            name="portaria_inicial"
            label="Portaria inicial"
            placeholder="Exemplo: 1234"
            data-testid="input-portaria-inicial"
            type="text"
          />
        </div>
        <div className="w-[33%]">
          <InputField
            register={register}
            control={control}
            name="portaria_final"
            label="Portaria final"
            placeholder="Exemplo: 1234"
            data-testid="input-portaria-final"
            type="text"
          />
        </div>
      </div>



      <div className="w-full flex gap-4">
        <div className="w-[50%]">
          <FormField
            control={control}
            name="ano"           
            render={({ field }) => (
              <FormItem >
                <FormLabel className="text-[#42474a] font-bold">Ano</FormLabel>
                <FormControl>
                  <Select  disabled={true} value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger data-testid="select-ano">
                      <SelectValue placeholder="Selecione um ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map((ano) => (
                        <SelectItem key={ano.codigo} value={ano.codigo}>
                          {ano.nome}
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
        <div className="w-[50%]">
          <FormField
            control={control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#42474a] font-bold">Listar para</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger data-testid="select-listar-para">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {listarParaOpcoes.map((item) => (
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

export default FiltroDeDo;