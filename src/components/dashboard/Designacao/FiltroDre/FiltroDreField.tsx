import { Combobox } from '@/components/ui/Combobox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFetchDREs } from '@/hooks/useUnidades';
import { Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

type DREOption = { codigoDRE: string; nomeDRE: string; siglaDRE: string };

interface Props {
  name?: string;
  label?: string;
  onChange?: (value: string) => void;
}

// Select de DRE dos filtros: lista as DREs de /unidades e grava o código EOL (codigoDRE) no form.
const FiltroDreField: React.FC<Props> = ({
  name = 'codigo_dre',
  label = 'Diretoria Regional de Educação (DRE)',
  onChange,
}) => {
  const { control } = useFormContext();
  const { data: dreOptions = [], isLoading } = useFetchDREs();

  const options = useMemo(
    () =>
      dreOptions.map((dre: DREOption) => ({
        label: `${dre.siglaDRE} - ${dre.nomeDRE}`,
        value: dre.codigoDRE,
      })),
    [dreOptions]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#313131] font-bold">{label}</FormLabel>
          <FormControl>
            {isLoading ? (
              <div className="flex h-10 items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <Combobox
                placeholder="Selecione"
                data-testid="select-codigo-dre"
                value={field.value ?? ""}
                options={options}
                onChange={(value) => {
                  field.onChange(value);
                  onChange?.(value);
                }}
              />
            )}
          </FormControl>
          <FormMessage showBlankSpace={false} />
        </FormItem>
      )}
    />
  );
};

export default FiltroDreField;
