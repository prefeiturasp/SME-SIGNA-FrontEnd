"use client";

import React from "react";
import { Flex, Steps } from 'antd';

const content = 'This is a content.';

const items = [
  {
    title: 'Finished',
    content,
  },
  {
    title: 'In Progress',
    content,
  },
  {
    title: 'Waiting',
    content,
  },
];
const StepperDesignacao: React.FC = () => {
  return (
    <Flex>
      <div style={{ flex: 1 }}>
        <Steps orientation="vertical" current={1} items={items} />
      </div>
    </Flex>
  );
};

export default StepperDesignacao;
