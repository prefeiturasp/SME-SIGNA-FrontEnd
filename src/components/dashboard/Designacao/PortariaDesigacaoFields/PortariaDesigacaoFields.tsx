"use client";


import { useFormContext } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


import { format } from "date-fns";
import { CalendarIcon,Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";







import { Button } from "@/components/ui/button";
import { InputBase } from "@/components/ui/input-base";


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Popconfirm } from "antd";
import { useState } from "react";



interface Props {

  readonly setDisableProximo: (disable: boolean) => void;
  isLoading: boolean;
}



const PortariaDesigacaoFields = ({ setDisableProximo, isLoading }: Props) => {


  const { register, control,  setValue } = useFormContext();




  const anos = Array.from({ length: new Date().getFullYear() - 1980 + 1 },

    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() }
    }
  )
  
  const impedimentoSubstituicao = [
    { codigo: '1', nome: 'por licença gestante' },
    { codigo: '2', nome: 'por licença médica' },
    { codigo: '3', nome: 'por licença paternidade' },
    { codigo: '4', nome: 'por férias' },
    { codigo: '5', nome: 'por licença maternidade especial' },
    { codigo: '6', nome: 'por liçença adoção' },
    { codigo: '7', nome: 'por licença guarda de menor' },
    { codigo: '8', nome: 'para concorrer a mandato eletivo, nos termos da Portaria nº 20/SEGES/2024 e da Lei Complementar nº 64, de 18 de maio de 1990' },
    { codigo: '9', nome: 'por licença nojo' },
    { codigo: '10', nome: 'por licenca gala' },
    { codigo: '11', nome: 'por afastamento por Cursos/Congressos/Competições' },
    { codigo: '12', nome: 'por licença maternidade' },
    { codigo: '13', nome: 'por prorrogação da licença à gestante' },
    { codigo: '14', nome: 'por licença parental de curta duração' },
    { codigo: '15', nome: 'por licença parental de longa duração' },
    { codigo: '16', nome: 'por Evento/Reunião' }
  ]


const [pendingValue, setPendingValue] = useState<string | null>(null);
const [openConfirm, setOpenConfirm] = useState(false);

const handleValueChange = (value: string) => {
  setPendingValue(value);
  setOpenConfirm(true);
};

const handleConfirm = () => {
  if (pendingValue) {
    setValue("ano", pendingValue);
  }
  setOpenConfirm(false);
};

const handleCancel = () => {
  setPendingValue(null);
  setOpenConfirm(false);
};

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2
            data-testid="loading-spinner"
            className="
        h-16 w-16 text-primary 
        animate-spin 
       "
          />
        </div>
      ) : (
<>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 ">
          <div className="w-full">
            <FormField
              {...register("portaria_designacao")}
              control={control}
              name="portaria_designacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Portaria da designação
                  </FormLabel>
                  <FormControl

                  >
                    <InputBase
                      placeholder="Nº da portaria"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-portaria-designacao"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
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
                        if(value.toString() !== new Date().getFullYear().toString()) {
                          return handleValueChange(value);
                        }
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger data-testid="select-ano">
                        <SelectValue placeholder="Selecione um ano" />
                      </SelectTrigger>

                      <SelectContent>
                        {anos.map(
                          (ano: { codigo: string; nome: string }) => (
                            <SelectItem
                              key={ano.codigo}
                              value={ano.codigo}
                            >
                              {ano.nome}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                      <Popconfirm
                      title="Mudar o ano"
                      description="Tem certeza que deseja mudar o ano?"
                      open={openConfirm}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}                      
                      okText="Sim"
                      cancelText="Não"
                    >
                    </Popconfirm>
                    </Select>                   
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full">
            <FormField
              {...register("numero_sei")}
              control={control}
              name="numero_sei"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Nº SEI
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      placeholder="Número SEI"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-numero-sei"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <div className="w-full">
            <FormField
              {...register("doc")}
              control={control}
              name="doc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Doc
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      placeholder="Número doc" value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-doc"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          </div>

          </div>         



          


          <div className="required text-[#42474a] font-bold pt-4 pb-4">Designação</div>

          <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4 ">

          <div className="w-full">

            <FormField
              {...register("a_partir_de")}
              control={control}
              name="a_partir_de"

              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="required text-[#42474a] font-bold">
                    A partir de
                  </FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl >
                        <Button
                          variant="customOutline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">

            <FormField
              {...register("designacao_data_final")}
              control={control}
              name="designacao_data_final"

              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="required text-[#42474a] font-bold">
                    Até
                  </FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl >
                        <Button
                          variant="customOutline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>




          <div className="w-full">
            <FormField
              control={control}
              name='carater_especial'
              render={({ field }) => (

                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">Carater Especial</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue="sim" className="w-fit ">
                      <div className="flex items-center mt-4 gap-3">
                        <Field orientation="horizontal">
                          <RadioGroupItem value="sim" id="doc-sim" aria-label="doc-sim" />
                          <Label htmlFor="doc-sim">Sim</Label>
                        </Field>

                        <Field orientation="horizontal">
                          <RadioGroupItem value="nao" id="doc-nao" aria-label="doc-nao" />
                          <Label htmlFor="doc-nao">Não</Label>
                        </Field>
                      </div>
                    </RadioGroup>

                  </FormControl>
                </FormItem>
              )}
            >

            </FormField>
          </div>







          <div className="w-full">
            <FormField
              {...register("motivo_cancelamento")}
              control={control}
              name="motivo_cancelamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Motivo Cancelamento
                  </FormLabel>
                  <FormControl>
                    <InputBase
                      placeholder="Motivo da Cancelamento"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value.target.value);
                      }}
                      data-testid="input-motivo-cancelamento"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={control}
              name="impedimento_substituicao"

              render={({ field }) => (

                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Impendimento para substituição:
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);

                      }}
                    >
                      <SelectTrigger data-testid="select-impedimento-substituicao" onClick={() => handleValueChange(field.value)}>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>

                      <SelectContent>
                        {impedimentoSubstituicao.map(
                          (impedimento: { codigo: string; nome: string }) => (
                            <SelectItem
                              key={impedimento.codigo}
                              value={impedimento.codigo}
                            >
                              {impedimento.nome}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          </div>
          
          </div>
        </>
      )}
    </>
  );
};

export default PortariaDesigacaoFields;
