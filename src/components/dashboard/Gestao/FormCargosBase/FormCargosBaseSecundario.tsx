
import { InfoCircleOutlined } from "@ant-design/icons";
import { InputField, SwitchField } from '@/components/ui/FieldsForm';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { Tooltip } from 'antd';


const FormCargosBaseSecundario: React.FC = () => {
  const { getValues, register, control } = useFormContext();
  const pesquisarLicencasNoSigpec = getValues("pesquisar_licencas_no_sigpec");
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
        <div className="border-b border-gray-200 pb-4">
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
        <div className="border-b border-gray-200 pb-4">
          <SwitchField
            register={register}
            control={control}
            name="testar_laudo"
            label="Testar laudo?"
            description="Realiza validação de laudo para este cargo antes da emissão."
            dataTestId="input-testar-laudo"
            showBlankSpace={false}
          />
        </div>
        <div >
          <SwitchField
            register={register}
            control={control}
            name="pesquisar_licencas_no_sigpec"
            label="Pesquisar Licenças no SIGPEC"
            description="Consulta licenças ativas antes da geração da Portaria."
            dataTestId="input-pesquisar-licencas-no-sigpec"
            showBlankSpace={false}
          />
        </div>
        {pesquisarLicencasNoSigpec && (
          <div className="pb-4 pl-8">
            <InputField
              register={register}
              control={control}
              name="quantidade_maxima_de_dias_de_licenca"
              label={<>
                <span className='required'>Quantidade máxima de dias de licença*</span>
                <Tooltip title="Licenças maiores que esse período serão ignoradas." placement="right">
                  <InfoCircleOutlined className='ml-2' style={{ color: "#B22B2A" }} />
                </Tooltip>
              </>}
              dataTestId="input-quantidade-maxima-de-dias-de-licenca"
              showBlankSpace={false}
              type="number"
              maxLength={4}
            />
            <p className='pt-1'>Informe o número máximo de dias que o servidor pode permanecer de licença.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default FormCargosBaseSecundario;