
import { SwitchField } from '@/components/ui/FieldsForm';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';


const FormCargosBaseSecundario: React.FC = () => {
  const { register, control } = useFormContext();
  return (
    <>
      <SimpleTableHeader
        title="Utilização do cargo"
        subtitle="Selecione os processos em que este cargo poderá ser utilizado."
      />
      <div className="flex flex-col gap-4">
        <div className="border-b border-gray-200 pb-4">
        <SwitchField
          register={register}
          control={control}
          name="utilizado_para_funcoes"
          label="Utilizado para funções?"
          description="Permite utilizar este cargo em processos de atribuição de funções."
          dataTestId="input-utilizacao-funcoes"
          showBlankSpace={false}          
        />
        </div>

        <div className="border-b border-gray-200 pb-4">
        <SwitchField
          register={register}
          control={control}
          name="utilizado_para_designacoes"
          label="Utilizado para designações?"
          description="Permite utilizar este cargo em processos de designação."
          dataTestId="input-utilizacao-designacoes"
          showBlankSpace={false}
        />
        </div>
        <div className="border-b border-gray-200 pb-4">
        <SwitchField
          register={register}
          control={control}
          name="utilizado_para_ste"
          label="Utilizado para STE?"
          description="Permite utilizar este cargo em processos de STE."
          dataTestId="input-utilizado-para-ste"
          showBlankSpace={false}
        />
        </div>
        <div className="border-b border-gray-200 pb-4">
        <SwitchField
          register={register}
          control={control}
          name="utilizado_para_permutas"
          label="Utilizado para permutas?"
          description="Permite utilizar este cargo em processos de permuta."
          dataTestId="input-utilizado-para-permutas"
          showBlankSpace={false}
        />
        </div>
        <div className="pb-4">
        <SwitchField
          register={register}
          control={control}
          name="cargo_base_ficticio"
          label="Cargo Base fictício?"
          description="Utilize esta opção apenas para cargos criados exclusivamente para controles internos do sistema, sem existência formal na estrutura administrativa."
          dataTestId="input-cargo-base-ficticio"
          showBlankSpace={false}
        />
        </div>        
      </div>  
    </>
  );
};

export default FormCargosBaseSecundario;