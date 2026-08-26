
import { InputField, MultiSelectField, SelectField } from '@/components/ui/FieldsForm';
import { InfoCircleOutlined } from "@ant-design/icons";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AtosOpcoes, TipoAtoSelectField } from '../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from 'antd';


export const StatusOpcoes = [
  { codigo: 'ATIVO', nome: 'Ativo' },
  { codigo: 'INATIVO', nome: 'Inativo' },
]

export const TipoCargoOpcoes = [
  { codigo: 'CARGO_VAGO', nome: 'Cargo vago' },
  { codigo: 'CARGO_DISPONIVEL', nome: 'Cargo disponível' },
]

export const variaveisOpcoes = [
  { codigo: 'PORTARIA', nome: 'Portaria' },
  { codigo: 'NUMERO_SEI', nome: 'Nº SEI' },
  { codigo: 'NOME_SERVIDOR', nome: 'Nome do servidor' },
  { codigo: 'NUMERO_RF', nome: 'Nº do RF' },
]

const FormCriarTextosPortaria: React.FC = () => {
  const { register, control } = useFormContext();

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <TipoAtoSelectField
          label={"Tipo de portaria"}
          name="tipo_portaria"
          AtosOpcoes={AtosOpcoes}
        />


        <SelectField
          register={register}
          control={control}
          name="status"
          label={<>
            <span className='required'>Status*</span>
            <Tooltip title="Modelos inativos não aparecem na emissão de novas Portarias." placement="right">
              <InfoCircleOutlined className='ml-2' style={{ color: "#B22B2A" }} />
            </Tooltip>
          </>}
          placeholder="Selecione"
          data-testid="input-status"
          options={StatusOpcoes.map((item) => ({
            value: item.codigo,
            label: item.nome,
          }))}
        />


        <InputField
          register={register}
          control={control}
          name="nome_modelo"
          label="Nome do Modelo"
          placeholder="Digite o nome do modelo..."
          data-testid="input-nome_modelo"
          type="text"
        />



        <SelectField
          register={register}
          control={control}
          name="tipo_cargo"
          label="Tipo de cargo"
          placeholder="Selecione"
          data-testid="input-tipo_cargo"
          options={TipoCargoOpcoes.map((item) => ({
            value: item.codigo,
            label: item.nome,
          }))}
        />
      </div>




      <MultiSelectField
        register={register}
        control={control}
        name="variavel"
        label={<>
          <span className='required'>Variavel*</span>
          <Tooltip title="Utilize as variáveis para incluir informações que serão preenchidas automaticamente pelo sistema na geração da Portaria." placement="right">
            <InfoCircleOutlined className='ml-2' style={{ color: "#B22B2A" }} />
          </Tooltip>
        </>}
        
        placeholder="Selecione"
        data-testid="input-status"
        options={variaveisOpcoes.map((item) => ({
          value: item.codigo,
          label: item.nome,
        }))}
      />


      <FormField
        {...register("observacoes")}
        control={control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required text-[#313131] font-bold">
              Observações
            </FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Digite informações adicionais..."
                value={field.value}
                onChange={(value) =>
                  field.onChange(value.target.value)
                }
                data-testid="input-observacoes"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </>
  );
};

export default FormCriarTextosPortaria;