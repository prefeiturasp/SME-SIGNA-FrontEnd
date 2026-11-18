
import { InputField, SelectField } from '@/components/ui/FieldsForm';
import React from 'react';
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useFormContext } from 'react-hook-form';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { FormControl, FormField, FormLabel, FormItem, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/Combobox';
import { Textarea } from '@/components/ui/textarea';
import { CargoDisplay } from '@/components/ui/CargoDisplay';
import { StatusOpcoes, CargosBaseGrupamento, SituacaoFuncionalOpcoes } from '../FiltroDeCargosBase/FiltroDeCargosBase';
import { ICargoType } from '@/types/cargos';
import { Label } from '@radix-ui/react-label';





interface Props {
  readonly CargosBaseOpcoes: ICargoType[];
  readonly isEditing: boolean;
  readonly isLoading: boolean;
  readonly codigoCargo?: string;
  readonly descricaoCompleta?: string;
}

const FormCargosBasePrincipal: React.FC<Props> = ({ CargosBaseOpcoes = [], isEditing = false, isLoading = false, codigoCargo = "", descricaoCompleta = "" }) => {
  const { register, control, setValue } = useFormContext();

  return (
    <>
      <div className="flex flex-row justify-between items-center gap-4">
        <SimpleTableHeader
          title="Informações do cargo"
          subtitle="Dados de identificação e classificação funcional."
        />

        <CargoDisplay
          codigoCargo={codigoCargo}
          descricaoCompleta={descricaoCompleta}
          isLoading={isLoading}
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">


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
                    const nomeCargo = CargosBaseOpcoes.find(cargo => cargo.codigoCargo.toString() === value)?.nomeCargo || "";
                    setValue("descricao_completa", nomeCargo, { shouldValidate: true });
                    setValue("descricao_eol", nomeCargo, { shouldValidate: true });
                  }}
                  placeholder="Selecione"
                  data-testid="select-codigo-cargo-eol"
                />
              </FormControl>
              <FormMessage showBlankSpace={false} />
            </FormItem>
          )}
        />

        <InputField
          register={register}
          control={control}
          name="descricao_completa"
          label="Descrição Completa"
          placeholder="Digite ..."
          dataTestId="input-descricao_completa"
          type="text"
          showBlankSpace={false}
        />

        <InputField
          register={register}
          control={control}
          name="descricao_eol"
          label="Descrição EOL"
          dataTestId="input-descricao_eol"
          type="text"
          disabled
          showBlankSpace={false}
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
          label={
            <div className="flex flex-row items-center ">
              <div>
                Descrição Resumida
              </div>
              <div>
                <Tooltip placement="topLeft"
                  title={<span>Descrição Resumida</span>}
                >
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="descricao_resumida" className="font-bold cursor-pointer">
                    <InfoCircleOutlined className='ml-2' style={{ color: "#B22B2A" }} />
                    </Label>
                  </div>
                </Tooltip>
              </div>
            </div>
          }
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
      <FormField
        control={control}
        name="provimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#313131] font-bold">
              Provimento
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={4}
                value={field.value ?? ""}
                placeholder="Ex.: portando diploma de Pedagogia e experiência de 3 anos no Magistério"
                data-testid="input-provimento"
              />
            </FormControl>
            <FormMessage showBlankSpace={false} />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormCargosBasePrincipal;