// pages/ssr-profile.jsx (debug)
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
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "none",
      }}
    >
      <img
        style={{ width: "60%" }}
        sizes="50%"
        src="/images/capa-login.png"
        alt="Login"
      />

      <div
        style={{
          paddingTop: "50vh",
          width: "40vw",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <img src="/images/logo-signa.png" alt="Login" />

          <Form {...form}>
            <FormField
              control={form.control}
              name="rf_ou_cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RF ou CPF <br /></FormLabel>
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
                      <FormLabel className="mb-2 text-sm font-medium text-[#333]">
                        Senha <br />
                      </FormLabel>

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

            <a
              className="block text-center text-sm text-muted-foreground hover:underline"
              href="#"
            >
              Esqueci minha senha
            </a>

            <div style={{ marginTop: 10 }}>
              <Button type="submit">Acessar</Button>
            </div>
          </Form>
          <img
            style={{ width: "149px", height: "46.954px" }}
            src="/images/logo_PrefSP.png"
            alt="Login"
          />
        </div>
      </div>
    </div>
  );
}
