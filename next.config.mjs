/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone", // Configura a saída para o modo standalone

    // React Compiler: desligado de propósito, a ser avaliado em branch própria.
    // O `babel-plugin-react-compiler` já está instalado — basta descomentar.
    //
    // Ligar em `infer` (tudo de uma vez) quebrou DesignacoesPasso1 em runtime
    // ("Cannot read properties of null"). A causa raiz — non-null assertions
    // sobre formDesignacaoData, que começa null no DesignacaoContext — já foi
    // corrigida, mas a adoção continua pendente de avaliação:
    //
    // - 8 arquivos são pulados pelo compiler por usarem `form.watch()` do
    //   react-hook-form. Isso é bail out seguro: ficam como estão hoje.
    // - O risco real são os 11 avisos de `react-hooks/exhaustive-deps`,
    //   concentrados no fluxo de designação. O compiler ignora os arrays de
    //   dependência e refaz a memoização, então onde a omissão era intencional
    //   o comportamento muda.
    // - `reactCompiler: { compilationMode: "annotation" }` compila apenas
    //   componentes marcados com "use memo", permitindo adoção gradual.
    // - Custo medido no build: ~21-27s -> ~31-38s.
    //
    // Atenção: os 1321 testes passam mesmo com o compiler quebrando a tela.
    // A verificação precisa ser manual, no fluxo real.
    //
    // reactCompiler: true,
};

export default nextConfig;
