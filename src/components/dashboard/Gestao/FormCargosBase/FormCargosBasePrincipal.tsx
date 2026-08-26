
import { InputField, SelectField } from '@/components/ui/FieldsForm';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { FormControl, FormField, FormLabel, FormItem, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/Combobox';
import { StatusOpcoes, CargosBaseGrupamento, SituacaoFuncionalOpcoes } from '../FiltroDeCargosBase/FiltroDeCargosBase';
import { ICargoType } from '@/types/cargos';

  


 
interface Props {
  readonly CargosBaseOpcoes: ICargoType[];
  readonly isEditing: boolean;
  readonly isLoading: boolean;
}

const FormCargosBasePrincipal: React.FC<Props> = ({ CargosBaseOpcoes=[], isEditing=false, isLoading=false }) => {
  const { register, control, setValue } = useFormContext();

  return (
    <>
      <SimpleTableHeader
        title="Informações do cargo"
        subtitle="Dados de identificação e classificação funcional."
      />
      <div className="flex flex-col gap-4">


        <FormField

          control={control}
          name="codigo_cargo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required text-[#313131] font-bold">
              Código do cargo no EOL
              </FormLabel>
              <FormControl>
                   <Combobox
                   disabled={isEditing || isLoading}                   
                    options={CargosBaseOpcoes.map(
                      (cargo: ICargoType) => ({
                        label: cargo.nomeCargo,
                        value: cargo.codigoCargo.toString(),
                      })
                    )}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("descricao_completa", CargosBaseOpcoes.find(cargo => cargo.codigoCargo.toString() === value)?.nomeCargo || "");
                    }}
                    placeholder="Selecione"
                    data-testid="select-codigo-cargo-eol"
                  />
              </FormControl>
              <FormMessage showBlankSpace={false} />
            </FormItem>
          )}
        />

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
          showBlankSpace={false}
        />

        <InputField
          register={register}
          control={control}
          name="descricao_resumida"
          label="Descrição Resumida"
          placeholder="Digite ..."
          data-testid="input-descricao_resumida"
          type="text"
          showBlankSpace={false}
        />





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
          showBlankSpace={false}
        />

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
          showBlankSpace={false}
        />
      </div>
    </>
  );
};

export default FormCargosBasePrincipal;