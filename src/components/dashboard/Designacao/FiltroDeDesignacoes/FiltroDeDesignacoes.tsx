import { DateRangeField, InputField } from '@/components/ui/FieldsForm';
import { FormControl, FormLabel, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Search, X } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Combobox } from '@/components/ui/Combobox';
import { useFetchDREs, useFetchUEs } from '@/hooks/useUnidades';
import { useFetchCargos } from '@/hooks/useCargos';

const FiltroDeDesignacoes: React.FC = () => {
  const { register, control, watch, setValue, clearErrors, reset } = useFormContext();

  const dreValue = watch("dre"); // agora armazena nomeDRE

  const watchedValues = watch(["rf", "nome_servidor", "periodo", "cargo_base", "cargo_sobreposto", "ano", "dre", "unidade_escolar"]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null);

  const { data: dreOptions = [] } = useFetchDREs();

  const dreCodigoParaUEs = React.useMemo(() => {
    const found = dreOptions.find(
      (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => dre.nomeDRE === dreValue
    );
    return found?.codigoDRE ?? "";
  }, [dreValue, dreOptions]);

  const { data: ueOptions = [], isLoading: isLoadingUEs } = useFetchUEs(dreCodigoParaUEs);
  const { data: cargosData = [] } = useFetchCargos();

  const cargos = cargosData.map((cargo: { codigoCargo: string | number; nomeCargo: string }) => ({
    codigo: String(cargo.codigoCargo),
    nome: cargo.nomeCargo,
  }));

  const anos = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() };
    }
  );

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-2">
        <div className="w-full flex gap-4">
          <div className="w-[35%]">
            <InputField
              register={register}
              control={control}
              name="rf"
              label="RF servidor Indicado / Titular"
              placeholder="Entre com o RF"
              data-testid="input-rf"
              type="number"
            />
          </div>
          <div className="w-[65%]">
            <InputField
              register={register}
              control={control}
              name="nome_servidor"
              label="Nome do servidor"
              placeholder="Nome do servidor"
              data-testid="input-nome-servidor"
              type="text"
            />
          </div>
        </div>

        <div className="w-full flex gap-4">
          <div className="w-[35%]">
            <DateRangeField
              register={register}
              control={control}
              name="periodo"
              label="Período"
              placeholder="Selecione um período"
            />
          </div>
          <div className="w-[65%]">
            <FormField
              control={control}
              name="cargo_base"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#42474a] font-bold">Cargo Base</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger data-testid="select-cargo-base">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.codigo} value={cargo.codigo}>
                            {cargo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="w-full flex gap-4">
          <div className="w-[65%]">
            <FormField
              control={control}
              name="cargo_sobreposto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#42474a] font-bold">Cargo Sobreposto</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger data-testid="select-cargo-sobreposto">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.codigo} value={cargo.codigo}>
                            {cargo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-[35%]">
            <FormField
              control={control}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#42474a] font-bold">Ano</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger data-testid="select-ano">
                        <SelectValue placeholder="Selecione um ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.map((ano) => (
                          <SelectItem key={ano.codigo} value={ano.codigo}>
                            {ano.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="w-full flex gap-4">
          <div className="w-[35%]">
            <FormField
              control={control}
              name="dre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#42474a] font-bold">DRE</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        clearErrors("dre");
                        setValue("unidade_escolar", "");
                      }}
                    >
                      <SelectTrigger data-testid="select-dre">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {dreOptions.map((dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => (
                          <SelectItem key={dre.siglaDRE} value={dre.nomeDRE}>
                            {dre.nomeDRE}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-[65%]">
            <FormField
              control={control}
              name="unidade_escolar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#42474a] font-bold">Unidade Escolar</FormLabel>
                  <FormControl>
                    {isLoadingUEs ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Combobox
                        options={ueOptions.map((ue: { codigoEscola: string; nomeEscola: string; siglaTipoEscola: string }) => ({
                          label: `${ue.siglaTipoEscola} - ${ue.nomeEscola}`,
                          value: ue.codigoEscola,
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          clearErrors("unidade_escolar");
                        }}
                        placeholder="Digite o nome da UE"
                        disabled={!dreValue}
                        data-testid="select-ue"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={!hasFilters}
          onClick={() => reset()}
          data-testid="btn-limpar-filtros"
        >
          <span className="font-bold">Limpar filtros</span>
          <X />
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="gap-2"
          disabled={!hasFilters}
          data-testid="btn-pesquisar"
        >
          <span className="font-bold">Pesquisar</span>
          <Search />
        </Button>
      </div>
    </>
  );
};

export default FiltroDeDesignacoes;