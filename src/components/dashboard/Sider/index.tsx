"use client";
import { Button, Menu, MenuProps } from 'antd';
import React, { useContext } from 'react';

import { CSSProperties } from 'styled-components';


import MenuItem from 'antd/es/menu/MenuItem';
import MenuContextProvider, { MenuContext } from './provider';
import {
  SiderContainer,
  SiderIconContainer,
  SiderMenuButtonToggleStyle,
  SiderMenuContainer,
  SiderMenuGroup,
  SiderMenuTitle,
  SiderSubMenuContainer,
} from './styles';
import Bars from '@/assets/icons/Bars';
import { X } from 'lucide-react';
import MenuBurger from '@/assets/icons/MenuBurger';

export type SiderMenuStylePros = {
  collapsed: boolean;
  $isSelected?: boolean;
  $hasRedBackground?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export type SiderSubMenuStylePros = {
  collapsed: boolean;
  isSubMenu: boolean;
};

export type MenuItemSMEProps = {
  url?: string;
  title: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItemSMEProps[];
};

export const getItemMenu = (
  url: string,
  title: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItemSMEProps[],
): MenuItemSMEProps => {
  return {
    title,
    url,
    key,
    icon,
    children,
  };
};

export type MenuSMEProps = {
  items?: MenuItemSMEProps[];
  menuProps?: MenuProps;
  styleSider?: CSSProperties | undefined;
  logoMenu?: React.ReactNode;
  onClick: (item: MenuItemSMEProps) => void;
  onClickMenuButtonToggle?: (collapsed: boolean) => void;
  routePathname?: string;
};

const SiderChildrenProvider: React.FC<MenuSMEProps> = ({
  items,
  menuProps,
  styleSider = {},
  logoMenu,
  onClick,
  onClickMenuButtonToggle,
}) => {
  const { collapsed, setCollapsed, setOpenKeys, openKeys, selectedKeys, setSelectedKeys } =
    useContext(MenuContext);
  const currentSelectedKeys = menuProps?.selectedKeys?.length ? menuProps?.selectedKeys : selectedKeys;

  const hasSelectedChild = (item: MenuItemSMEProps): boolean => {
    if (currentSelectedKeys?.includes(item?.key?.toString())) return true;
    if (!item?.children?.length) return false;
    return item.children.some((child) => hasSelectedChild(child));
  };

  const montarMenuItem = (item: MenuItemSMEProps) => {
    return (
      <MenuItem
        key={item.key}
        id={item?.key?.toString()}
        onClick={() => {
          setOpenKeys([]);
          setSelectedKeys([item?.key?.toString()]);

          if (!item?.children?.length && !collapsed) setCollapsed(!collapsed);

          if (onClick) onClick(item);
        }}
      >
        {item?.title}
      </MenuItem>
    );
  };

  const montarSubMenu = (menuItem: MenuItemSMEProps, isSubMenu = false) => (
    (() => {
      const itemKey = menuItem?.key?.toString();
      const itemIsSelected = hasSelectedChild(menuItem);
      const isOpen = !!itemKey && openKeys.includes(itemKey);
      const hasRedBackground = !isSubMenu && !itemIsSelected && !isOpen;

      return (
        <SiderSubMenuContainer
          isSubMenu={isSubMenu}
          collapsed={collapsed}
          key={menuItem?.key}
          title={
            <SiderMenuGroup collapsed={collapsed}>
              <SiderIconContainer collapsed={collapsed} $hasRedBackground={hasRedBackground}>
                {menuItem?.icon}
              </SiderIconContainer>
              <SiderMenuTitle collapsed={collapsed} $hasRedBackground={hasRedBackground}>
                {menuItem?.title}
              </SiderMenuTitle>
              {collapsed && (
                <Bars width={16} height={16} opacity={0.5} style={{ top: 12, right: 6, position: 'absolute' }} />
              )}
            </SiderMenuGroup>
          }
        >
          <>
            {menuItem?.children?.map((item: MenuItemSMEProps) => {
              if (item?.children?.length) return montarSubMenu(item, true);
              return montarMenuItem(item);
            })}
          </>
        </SiderSubMenuContainer>
      );
    })()
  );

  if (!items?.length) return <></>;

  return (
    <SiderContainer
      collapsedSider={collapsed}
      width={collapsed ? 105 : 232}
      style={{ ...styleSider }}
      trigger={null}
      collapsible
      collapsed={false}
      breakpoint='md'
      onCollapse={() => {
        setCollapsed(true);
        setOpenKeys([]);
        if (onClickMenuButtonToggle) onClickMenuButtonToggle(true);
      }}
      onMouseLeave={() => {
        setOpenKeys([]);
        setCollapsed(true);
      }}
    >
      <SiderMenuButtonToggleStyle collapsed={collapsed}>
        {collapsed ? null : logoMenu}
        <Button
          type='text'
          icon={collapsed ? <MenuBurger width={18} height={12}  />
          : <X width={24} height={24} />}
          onClick={() => {
            const newValue = !collapsed;
            setCollapsed(newValue);

            if (newValue) setOpenKeys([]);

            if (onClickMenuButtonToggle) onClickMenuButtonToggle(newValue);
          }}
        />
      </SiderMenuButtonToggleStyle>

      <SiderMenuContainer collapsed={collapsed} className='secound-child-menu-and-sub-menus'>
        <Menu
          mode='inline'
          {...menuProps}
          openKeys={openKeys}
          selectedKeys={currentSelectedKeys}
          onOpenChange={(newOpenKeys: string[]) => {
            if (collapsed) {
              const newValue = !collapsed;
              setCollapsed(newValue);
            }

            setOpenKeys(newOpenKeys);

            if (menuProps?.onOpenChange) {
              menuProps.onOpenChange(newOpenKeys);
            }
          }}
        >
          <>{items?.map((menuItem: MenuItemSMEProps) => montarSubMenu(menuItem))}</>
        </Menu>
      </SiderMenuContainer>
    </SiderContainer>
  );
};

const Sider: React.FC<MenuSMEProps> = (props) => (
  <MenuContextProvider>
    <SiderChildrenProvider {...props} />
  </MenuContextProvider>
);

export default Sider;
