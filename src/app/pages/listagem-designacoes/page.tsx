"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/FullPageLoader";

export default function ListagemDesignacoesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pages/atos-administrativos");
  }, [router]);

  return <FullPageLoader />;
}
