"use client";
import LogoSigna from "@/assets/images/logo-signa-completo-branco.png";

import * as React from "react";
import User from "@/assets/icons/User";
import Designacao from "@/assets/icons/Designacao";
 
import Sider from "../Sider";
import { Nomeacao } from "@/assets/icons/Nomeacao";
import { Protocolo } from "@/assets/icons/Protocolo";
import { Apoio } from "@/assets/icons/Apoio";
import Image from "next/image";
import { useRouter } from "next/navigation";

 

export type MenuItemSMEProps = {
  url?: string;
  title: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItemSMEProps[];
};

export enum MenuEnum {
  Designacao,
  Designacoes,
  AlterarDataDoD,  
  MeusDados,
  ListarMeusDados,
  BaixarLauda,
  Nomeacao,
  Nomeacoes,
  Protocolo,
  Protocolos,
  ApoioAdministrativo,   
  ApoiosAdministrativos,
}
 




export const MENU_MEUS_DADOS: MenuItemConectaProps = {
  key: MenuEnum.MeusDados,
  title: 'Meus dados',
  icon: <User />, 
  children: [
    {
      key: MenuEnum.ListarMeusDados,
      title: 'Meus dados',
      url: "/pages/meus-dados",
    },
  ],
};

export const MENU_DESIGNACAO: MenuItemConectaProps = {
  key: MenuEnum.Designacao,
  title: 'Designações',
  icon: <Designacao width={20} height={20} />,
  children: [
    {
      key: MenuEnum.Designacoes,
      title: 'Designação',
      url: "/pages/listagem-designacoes",
 
    },
    {
      key: MenuEnum.AlterarDataDoD,
      title: 'Alterar data do D.O',
      url: "/pages/alterar-data-do",
 
    },
    {
      key: MenuEnum.BaixarLauda,
      title: 'Baixar lauda',
      url: "/pages/baixar-lauda",
 
    },
  ],
};


export const MENU_NOMEACAO: MenuItemConectaProps = {
  key: MenuEnum.Nomeacao,
  title: 'Nomeação',
  icon: <Nomeacao />, 
  children: [
    {
      key: MenuEnum.Nomeacoes,
      title: 'Nomeações',
      url: "/pages/nomeacao",
    },
  ],
};

 
export const MENU_PROTOCOLO: MenuItemConectaProps = {
  key: MenuEnum.Protocolo,
  title: 'Protocolo',
  icon: <Protocolo />, 
  children: [
    {
      key: MenuEnum.Protocolos,
      title: 'Protocolos',
      url: "/pages/protocolo",
    },
  ],
};

export const MENU_APOIO_ADMINISTRATIVO: MenuItemConectaProps = {
  key: MenuEnum.ApoioAdministrativo,
  title: 'Apoio admin.',
  icon: <Apoio />, 
  children: [
    {
      key: MenuEnum.ApoiosAdministrativos,
      title: 'Apoio administrativo',
      url: "/pages/apoio-administrativo",
    },
  ],
};

 
 
export interface MenuItemConectaProps extends MenuItemSMEProps {
  key: MenuEnum;
  children?: MenuItemConectaProps[];
}

export const menus: MenuItemConectaProps[] = [
  MENU_MEUS_DADOS,
  MENU_DESIGNACAO,
  MENU_NOMEACAO,
  MENU_PROTOCOLO,
  MENU_APOIO_ADMINISTRATIVO,

];
 
export function AppNewSidebar() {
  const navigate = useRouter();

  const itemMenuEscolhido = (item: MenuItemSMEProps) => {
    if (item?.url) {
      navigate.push(item.url);
    }
  };
  return (
    <Sider
      onClick={itemMenuEscolhido}
      styleSider={{ zIndex: 12 }}
      items={menus}
      logoMenu={
        <Image src={LogoSigna} alt="Logo Signa" width={97} height={56} />
      }
     />
  );
}
