import { DateField, InputField } from '@/components/ui/FieldsForm';
import { FormControl,FormLabel,FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';



 


const FiltroDeDesignacoes: React.FC = () => {
  const { register, control  } = useFormContext();
  const cargosBase = [
    { codigo: "1", nome: "Diretor" },
    { codigo: "2", nome: "Supervisor" },
    { codigo: "3", nome: "Coordenador" },
    { codigo: "4", nome: "Secretário de escola" },
    { codigo: "5", nome: "Assistente de diretor" },
  ];
  const cargosSobreposto = [
    ...cargosBase,
    { codigo: "6", nome: "Professor" },
    { codigo: "7", nome: "Assistente" },
    { codigo: "8", nome: "Outro" },
  ]


  const unidadesEscolares = [
    { codigo: "1", nome: "UE 01" },
    { codigo: "2", nome: "UE 02" },
    { codigo: "3", nome: "UE 03" },
    { codigo: "4", nome: "UE 04" },
    { codigo: "5", nome: "UE 05" },
  ];

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
            <DateField
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
                  <FormLabel className="required text-[#42474a] font-bold">
                    Cargo Base
                  </FormLabel>
                  <FormControl>
                     <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger data-testid="select-cargo-base">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>

                      <SelectContent>
                        {cargosBase.map((cargo) => (
                          <SelectItem
                            key={cargo.codigo}
                            value={cargo.codigo}
                          >
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
                  <FormLabel className="required text-[#42474a] font-bold">
                    Cargo Sobreposto
                  </FormLabel>
                  <FormControl>
                     <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger data-testid="select-cargo-sobreposto">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>

                      <SelectContent>
                        {cargosSobreposto.map((cargo) => (
                          <SelectItem
                            key={cargo.codigo}
                            value={cargo.codigo}
                          >
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
            {/* to-do verificar qual o tipo desse input */}

            <InputField
              register={register}
              control={control}
              name="dre"
              label="DRE"
              placeholder="Informe a DRE"
              data-testid="input-dre"
              type="text"
            />
          </div>
        </div>


        <div className="w-full flex gap-4">
          <div className="w-[65%]">
            <FormField
             
              control={control}
              name="unidade_escolar"
              
              render={({ field }) => (
                <FormItem >
                  <FormLabel className="required text-[#42474a] font-bold">
                    Unidade escolar
                  </FormLabel>
                  <FormControl>
                     <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger data-testid="select-unidade-escolar">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>

                      <SelectContent>
                        {unidadesEscolares.map((ue) => (
                          <SelectItem
                            key={ue.codigo}
                            value={ue.codigo}
                          >
                            {ue.nome}
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
                  <FormLabel className="required text-[#42474a] font-bold">
                    Ano
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {

                        field.onChange(value);
                      }}
                    >
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
      </div >
      <div className="flex justify-end mt-4">
        <Button type="submit" variant="outline" className="gap-2" >
          <span className="font-bold">Pesquisar</span>
          <Search />
        </Button>
      </div>

    </>
  );
}

export default FiltroDeDesignacoes;