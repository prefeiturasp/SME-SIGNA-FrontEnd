import type { PaginationProps } from 'antd';
import { LeftOutlined,  RightOutlined, } from '@ant-design/icons';
import React from 'react';

export const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if ((type === 'prev' || type === 'next') && React.isValidElement(originalElement)) {
      const label =
        type === 'prev' ? (
          <div className='flex items-center gap-1'>
            <LeftOutlined />
            Anterior
          </div>
        ) : (
          <div className='flex items-center gap-1'>
            Próximo
            <RightOutlined />
          </div>
        );
  
      return React.cloneElement(originalElement, {}, label);
    }
    return originalElement;
  };
  

export const MostrarRegistros = ({page, total}: {page: number, total: number}) => {
  const de = (page - 1) * 10 + 1;
  const ate = total > page * 10 ? page * 10 : total;
  return (
    <span className="text-sm text-[#555]">
      <strong> Mostrando {de}-{ate} de {total} registro(s)</strong>
    </span>
  );
};
