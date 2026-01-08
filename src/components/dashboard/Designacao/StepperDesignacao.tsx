"use client";

import React from "react";
import { Flex, Steps } from 'antd';

const content = 'This is a content.';

const items = [
  {
    title: 'Validar dados',
    content,
  },
  {
    title: 'Pesquisa de  unidade',
    content,
  },
  {
    title: 'Waiting',
    content,
  },
];
const StepperDesignacao: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Flex className={className}>
      <div style={{ flex: 1 }}>
        <Steps orientation="vertical" current={1} items={items} />
      </div>
    </Flex>
  );
};

export default StepperDesignacao;
