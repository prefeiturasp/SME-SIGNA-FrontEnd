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

export async function getServerSideProps(context) {
  const token = context.query.token || null;

  // DEBUG: mostrar o token (string curta) e o tamanho
  const tokenPreview = token
    ? `${token.slice(0, 20)}... (len=${token.length})`
    : null;

  try {
    const resp = await fetch("http://localhost:8000/api/profile/", {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      // não seguir redirect automaticamente pode ajudar a detectar redirects:
      redirect: "manual",
    });

    const status = resp.status;
    // tenta ler texto (pode falhar se não for json)
    const text = await resp.text();
    // também pega alguns headers úteis
    const serverHeaders = {};
    ["www-authenticate", "content-type", "vary", "set-cookie"].forEach((h) => {
      if (resp.headers.get(h)) serverHeaders[h] = resp.headers.get(h);
    });

    return {
      props: {
        tokenPreview,
        tokenExists: !!token,
        fetchStatus: status,
        fetchBody: text,
        fetchHeaders: serverHeaders,
      },
    };
  } catch (err) {
    return {
      props: { tokenPreview, tokenExists: !!token, fetchError: String(err) },
    };
  }
}

export default function LoginTela({
  tokenPreview,
  tokenExists,
  fetchStatus,
  fetchBody,
  fetchHeaders,
  fetchError,
}) {
  const form = useForm({
    defaultValues: {
      rf_ou_cpf: "",
      senha: "",
    },
  });
  const onSubmit = (values) => {
    console.log(values.rf_ou_cpf, values.senha);
  };
  return (
    <div
      style={{
        width: "95%",
        height: "100%",
        display: "flex",
        overflow: "none",
      }}
    >
      <img
        style={{ width: "60vw", height: "100vh" }}
        src="/images/capa-login.png"
        alt="Login"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40vw",
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "0 32px 80px 32px",
          }}
        >
          <img src="/images/logo-signa.png" alt="Login" />

          <div
            style={{
              padding: "65px 0px",
            }}
          >
            <Form {...form}>
              <FormField
                control={form.control}
                name="rf_ou_cpf"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                        <FormLabel>
                            RF ou CPF  <HelpCircle className="size-4" />
                          </FormLabel>                          
                        </TooltipTrigger>
                        <TooltipContent>
                         Digite seu RF ou CPF
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <FormControl>
                      <Input
                        type="rf_ou_cpf"
                        id="rf_ou_cpf"
                        placeholder="Seu e-mail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">                           
                        <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                        <FormLabel>
                           Senha  <HelpCircle type="outline" className="size-4" />
                          </FormLabel>                          
                        </TooltipTrigger>
                        <TooltipContent>
                         Digite sua Senha
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                        <FormControl>
                          <Input
                            type="password"
                            id="senha"
                            placeholder="Sua senha"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>

                        <FormMessage className="mt-2 text-sm" />
                      </FormItem>
                    )}
                  />
                )}
              />

              <div style={{ marginTop: 10 }}>
                <Button
                  onClick={() => console.log("testw")}
                  type="submit"
                  color="blue"
                  size="lg"
                  style={{
                    borderRadius: "4px",
                    background: "#717FC7",
                    color: "#fff",
                    width: "100%",
                  }}
                >
                  Acessar
                </Button>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="link"
                      style={{
                        color: "#717FC7",
                        width: "100%",
                        alignSelf: "center",
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Esqueci minha senha</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Form>
          </div>
          <img
            style={{ width: "149px", height: "46.954px", alignSelf: "center" }}
            src="/images/logo_PrefSP.png"
            alt="Login"
          />
        </div>
      </div>
    </div>
  );
}
