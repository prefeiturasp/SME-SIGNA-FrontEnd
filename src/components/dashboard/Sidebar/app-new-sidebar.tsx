"use client";
import LogoSigna from "@/assets/images/logo-signa-completo-branco.png";

import * as React from "react";
import Home from "@/assets/icons/Home";
import User from "@/assets/icons/User";
import Bars from "@/assets/icons/Bars";
import Designacao from "@/assets/icons/Designacao";
import { cn } from "@/lib/utils";
import { SidebarLink } from "./SidebarLink";
import { usePathname, useRouter } from "next/navigation";
import LogoSignaNome from "@/assets/images/logo-signa.png";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Sider from "../Sider";
import { Nomeacao } from "@/assets/icons/Nomeacao";
import { Protocolo } from "@/assets/icons/Protocolo";
import { Apoio } from "@/assets/icons/Apoio";
import Image from "next/image";


export enum ROUTES {
  PRINCIPAL = '/',
  LOGIN = '/login',
  LOGIN_AUTOMATICO_PELO_TOKEN = '/validar-email/:token',
  CADASTRO_DE_USUARIO = '/cadastre-se',
  MEUS_DADOS = '/meus-dados',
  REDEFINIR_SENHA = '/redefinir-senha',
  REDEFINIR_SENHA_TOKEN = '/redefinir-senha/:token',
  CADASTRO = '/cadastro',
  CADASTRO_DE_PROPOSTAS = '/cadastro/cadastro-de-propostas',
  CADASTRO_DE_PROPOSTAS_NOVO = '/cadastro/cadastro-de-propostas/novo',
  CADASTRO_DE_PROPOSTAS_EDITAR = '/cadastro/cadastro-de-propostas/editar/:id',
  AREA_PROMOTORA = '/cadastro/area-promotora',
  AREA_PROMOTORA_NOVO = '/cadastro/area-promotora/novo',
  AREA_PROMOTORA_EDITAR = '/cadastro/area-promotora/editar/:id',
  USUARIO_REDE_PARCERIA = '/cadastro/rede-parceria',
  USUARIO_REDE_PARCERIA_NOVO = '/cadastro/rede-parceria/novo',
  USUARIO_REDE_PARCERIA_EDITAR = '/cadastro/rede-parceria/editar/:id',
  SEM_PERMISSAO = '/sem-permissao',
  AREA_PUBLICA = '/area-publica',
  AREA_PUBLICA_VISUALIZAR_FORMACAO = '/area-publica/visualizar/:id',
  INSCRICAO = '/inscricao',
  INSCRICAO_CURSISTA = '/inscricao/:id',
  FORMACAOES_INSCRICOES = '/formacoes/inscricoes',
  FORMACAOES_INSCRICOES_EDITAR = '/formacoes/inscricoes/editar',
  FORMACAOES_INSCRICOES_EDITAR_ID = '/formacoes/inscricoes/editar/:id',
  FORMACAOES_INSCRICOES_NOVO = '/formacoes/inscricoes/novo',
  FORMACAOES_INSCRICOES_NOVO_ID = '/formacoes/inscricoes/novo/:id',
  FORMACAOES_INSCRICOES_POR_ARQUIVO = '/formacoes/inscricoes/arquivo',
  FORMACAOES_INSCRICOES_POR_ARQUIVO_ID = '/formacoes/inscricoes/arquivo/:id',
  NOTIFICACOES = '/notificacoes',
  NOTIFICACOES_DETALHES = '/notificacoes/detalhes/:id',
  LISTA_PRESENCA_CODAF = '/formacoes/lista-presenca-codaf',
  CERTIFICADOS = '/certificados',
  CERTIFICADOS_PESQUISA = '/certificados-pesquisa',
  LISTA_PRESENCA_CODAF_NOVO = '/formacoes/lista-presenca-codaf/novo',
  LISTA_PRESENCA_CODAF_EDITAR = '/formacoes/lista-presenca-codaf/editar/:id',
  RELATORIO_INSCRITOS_POR_FORMACAO = '/relatorios/inscritos-por-formacao',
}

export type MenuItemSMEProps = {
  url?: string;
  title: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItemSMEProps[];
};

export enum MenuEnum {
  Principal = 1,
  MeusDados,
  ListarMeusDados,
  Designacao,
  Designacoes,
  AlterarDataDoD,
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
