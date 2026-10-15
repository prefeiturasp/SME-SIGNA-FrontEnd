# Frontend - Next.js SME - SIGNA

## 🥞 Stack

-   [Next.js v19](https://nextjs.org/docs)
-   [React v18](https://react.dev/reference/react)
-   [Tailwindcss v4](https://tailwindcss.com/docs/installation)
-   [Shadcn](https://ui.shadcn.com/docs)
-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
-   [Vitest](https://vitest.dev/guide/)


## 🟢 Versão do Node

A versão do Node usada no projeto está fixada no arquivo [`.nvmrc`](.nvmrc). Se você usa o [nvm](https://github.com/nvm-sh/nvm), rode na raiz do projeto:

```bash
nvm use

```

Se ainda não tiver essa versão instalada, instale antes com `nvm install`.

## 📦 Gerenciador de pacotes

O `npm` é o gerenciador oficial do projeto: é ele quem builda a aplicação nos ambientes de qa, homolog e prod (veja `Dockerfile` e `Dockerfile.production`, que rodam `npm ci`). **Sempre que uma dependência for adicionada/removida/atualizada, commite o `package-lock.json` resultante junto com o `package.json`.** Não use `yarn` nem `pnpm`, para não gerar outros lockfiles.

## 🚀 Executando o projeto sem Docker

### Instale as dependências do projeto

```bash
npm install

```

### Execute o projeto

```bash
npm run dev

```

Após isso, o projeto estará executando no endereço [localhost:3000](http://localhost:3000).

## 🧪 Executando os testes

```bash
npm run test

```

## 🧪 Executando a cobertura dos testes

```bash
npm run test:coverage

```
