"use client";

import React from "react";
import { Flex, Steps } from 'antd';

 
const items = [
  {
    title: 'Servidor indicado'    
  },
  {
    title: 'Designação'    
  },
  {
    title: 'Portaria'
  },
];
const StepperDesignacao: React.FC<{ className?: string, current?: number }> = ({ className, current=1   }) => {
  return (
    <Flex className={className} data-testid="stepper-designacao">
      <div style={{ flex: 1 }}> 
        <Steps className="py-5" orientation="horizontal" current={current} items={items} />
      </div>
    </Flex>
  );
};

export default StepperDesignacao;
