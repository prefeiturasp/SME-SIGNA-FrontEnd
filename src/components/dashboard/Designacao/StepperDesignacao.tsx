"use client";

import React from "react";
import { Flex, Steps } from 'antd';

 
const items = [
  {
    title: 'Validar dados',
    content: 'Validar dados da Designação',
  },
  {
    title: 'Pesquisa de  unidade',
    content: 'Dados da Pesquisa de  unidade',
  },
  {
    title: 'Próximos passos',
    content: 'Próximos passos da Designação',
  },
];
const StepperDesignacao: React.FC<{ className?: string, current?: number }> = ({ className, current=1   }) => {
  return (
    <Flex className={className}>
      <div style={{ flex: 1 }}>
        <Steps orientation="vertical" current={current} items={items} />
      </div>
    </Flex>
  );
};

export default StepperDesignacao;
