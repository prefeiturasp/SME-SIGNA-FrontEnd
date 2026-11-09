"use client";
import LogoSigna from "@/assets/images/logo-signa-completo-branco.png";

import * as React from "react";
import User from "@/assets/icons/User";
import Designacao from "@/assets/icons/Designacao";

import Sider from "../Sider";
import type { MenuItemSMEProps } from "../Sider";
import { Nomeacao } from "@/assets/icons/Nomeacao";
import { Protocolo } from "@/assets/icons/Protocolo";
import { Apoio } from "@/assets/icons/Apoio";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings } from "@/assets/icons/Settings";

export type { MenuItemSMEProps };

export enum MenuEnum {
  AtosAdministrativos,
  Designacao,
  Designacoes,
  AlterarDataDoD,
  MeusDados,
  BaixarLauda,
  Nomeacao,
  Protocolo,
  ApoioAdministrativo,
  Gestao,
  GestaoDeAcessos,
  GestaoDeRemetentes,
  CargosBase,
  TextosDePortaria,
}

export const MENU_MEUS_DADOS: MenuItemConectaProps = {
  key: MenuEnum.MeusDados,
  title: 'Meus dados',
  icon: <User />,
  url: "/pages/meus-dados",
};

export const MENU_DESIGNACAO: MenuItemConectaProps = {
  key: MenuEnum.Designacao,
  title: 'Designações',
  icon: <Designacao width={20} height={20} />,
  children: [
    {
      key: MenuEnum.AtosAdministrativos,
      title: 'Atos administrativos',
      url: "/pages/atos-administrativos",
    },
    {
      key: MenuEnum.AlterarDataDoD,
      title: 'Publicação no Diário Oficial',
      url: "/pages/alterar-data-do",
    },
    {
      key: MenuEnum.BaixarLauda,
      title: 'Laudas',
      url: "/pages/baixar-lauda",
    },
    {
      key: MenuEnum.CargosBase,
      title: 'Cargos base',
      url: "/pages/gestao/cargos-base",
    },
    {
      key: MenuEnum.TextosDePortaria,
      title: 'Textos de portaria',
      url: "/pages/gestao/textos-de-portaria",
    },
  ],
};

export const MENU_NOMEACAO: MenuItemConectaProps = {
  key: MenuEnum.Nomeacao,
  title: 'Nomeação',
  icon: <Nomeacao />,
  url: "/pages/nomeacao",
};

export const MENU_PROTOCOLO: MenuItemConectaProps = {
  key: MenuEnum.Protocolo,
  title: 'Protocolo',
  icon: <Protocolo />,
  url: "/pages/protocolo",
};

export const MENU_APOIO_ADMINISTRATIVO: MenuItemConectaProps = {
  key: MenuEnum.ApoioAdministrativo,
  title: 'Apoio administrativo',
  collapsedTitle: 'Apoio admin.',
  icon: <Apoio />,
  url: "/pages/apoio-administrativo",
};

export const MENU_GESTAO: MenuItemConectaProps = {
  key: MenuEnum.Gestao,
  title: 'Gestão',
  icon: <Settings />,
  children: [
    {
      key: MenuEnum.GestaoDeAcessos,
      title: 'Gestão de acessos',
      url: "/pages/gestao/gestao-de-acessos",
    },
    {
      key: MenuEnum.GestaoDeRemetentes,
      title: 'Gestão de remetentes',
      url: "/pages/gestao/gestao-de-remetentes",
    },
  ],
};

export interface MenuItemConectaProps extends MenuItemSMEProps {
  key: MenuEnum;
  children?: MenuItemConectaProps[];
}

export const menus: MenuItemConectaProps[] = [
  MENU_DESIGNACAO,
  MENU_NOMEACAO,
  MENU_PROTOCOLO,
  MENU_APOIO_ADMINISTRATIVO,
  MENU_GESTAO,
  MENU_MEUS_DADOS,
];

function collectMenuUrls(items: MenuItemSMEProps[]): string[] {
  return items.flatMap((item) => [
    ...(item.url ? [item.url] : []),
    ...(item.children ? collectMenuUrls(item.children) : []),
  ]);
}

export function AppNewSidebar() {
  const navigate = useRouter();

  React.useEffect(() => {
    collectMenuUrls(menus).forEach((url) => navigate.prefetch(url));
  }, [navigate]);

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
