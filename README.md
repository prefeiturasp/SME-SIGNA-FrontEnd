# Frontend - Next.js SME - SIGNA

## 🥞 Stack

-   [Next.js v19](https://nextjs.org/docs)
-   [React v18](https://react.dev/reference/react)
-   [Tailwindcss v4](https://tailwindcss.com/docs/installation)
-   [Shadcn](https://ui.shadcn.com/docs)
-   [TypeScript](https://www.typescriptlang.org/docs/)
-   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
-   [Vitest](https://vitest.dev/guide/)


## 📦 Gerenciador de pacotes

O `yarn` é o gerenciador oficial do projeto: é ele quem builda a aplicação nos ambientes de qa, homolog e prod (veja `Dockerfile` e `Dockerfile.production`, que rodam `yarn install`/`yarn --frozen-lockfile`). O `npm` pode ser usado localmente por conveniência, mas **sempre que uma dependência for adicionada/removida/atualizada, rode `yarn install` e commite o `yarn.lock` resultante junto com o `package.json`**, mesmo que a instalação local tenha sido feita via `npm`. Caso contrário, os ambientes reais podem subir com dependências desatualizadas ou ausentes.

O `package-lock.json` não é usado em nenhum build/deploy e pode ficar defasado sem problema.

## 🚀 Executando o projeto sem Docker

### Instale as dependências do projeto

```bash
yarn install

npm install

```

### Execute o projeto

```bash
yarn run dev

npm run dev

```

Após isso, o projeto estará executando no endereço [localhost:3000](http://localhost:3000).

## 🧪 Executando os testes

```bash
yarn run test

npm run test

```

## 🧪 Executando a cobertura dos testes

```bash
yarn run test:coverage

npm run test:coverage

```
