"use client";

import React from "react";
 
import DesignacaoPasso3 from "@/app/pages/designacoes/designacoes-passo-3/page";
import { DesignacaoProvider } from "@/app/pages/designacoes/DesignacaoContext";

export default function LoginTela() { 
     return <DesignacaoProvider><DesignacaoPasso3 /></DesignacaoProvider> ;   
}
