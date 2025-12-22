"use client";

import React, { useState } from "react";

import { CustomAlert as Alert } from "@/components/ui/CustomAlert";

import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import useRecuperarSenha from "@/hooks/useRecuperarSenha";
import Link from "next/link";
import LogoSigna from "@/components/login/LogoSigna";
import FormRecuperarSenha from "@/components/login/FormRecuperarSenha";

export default function RecuperacaoDeSenhaTela() {
 

  return (<FormRecuperarSenha />)
}
