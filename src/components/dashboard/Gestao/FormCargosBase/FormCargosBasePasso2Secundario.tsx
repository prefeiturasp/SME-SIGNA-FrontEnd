
import { InfoCircleOutlined } from "@ant-design/icons";
import { DateField, InputField, SwitchField } from '@/components/ui/FieldsForm';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { Divider, Tooltip } from 'antd';
import FundoBranco from "../../FundoBranco/QuadroBranco";
import FormCargosBasePasso2Primario from "./FormCargosBasePasso2Primario";


const FormCargosBasePasso2Secundario: React.FC = () => {
  const { register, control, setValue } = useFormContext();
  const pesquisarLicencasNoSigpec = useWatch({
    control,
    name: "pesquisar_licencas_no_sigpec",
  });
  const possuiPeriodoFechado = useWatch({
    control,
    name: "possui_periodo_fechado",
  });
  return (


    <div className="w-full flex flex-col lg:flex-row gap-4 mb-4 mt-8" >
      <FundoBranco className="w-full lg:w-[50%]">
        {/* <FormCargosBasePrincipal CargosBaseOpcoes={CargosBaseOpcoes} isEditing={id !== null} isLoading={isLoadingEditarCargosBase || isLoadingCargosBase}/> */}
        <FormCargosBasePasso2Primario />
      </FundoBranco>

      <FundoBranco className="w-full lg:w-[50%]">
        <FormCargosBasePasso2Secundario />
      </FundoBranco>
    </div>


  );
};

export default FormCargosBasePasso2Secundario;