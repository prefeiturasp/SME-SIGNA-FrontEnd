
import { DateRangePickerField, InputField, SelectField } from '@/components/ui/FieldsForm';

import React, { useEffect, useState } from 'react';
import { fetchCargosDesignacoes } from '@/actions/designacao';
import { useFormContext } from 'react-hook-form';
import FiltroAcoes from '../FiltroAcoes/FiltroAcoes';
import { AtosOpcoes, StatusPublicacaoOpcoes, TipoAtoSelectField } from './FiltroDeAtosAdministrativos';

interface Props {
  codigoUe: string;
  onClear?: () => void;
}

const FiltroDeHistoricoDeAtosAdministrativos: React.FC<Props> = ({ codigoUe, onClear }) => {
  const { register, control, watch } = useFormContext();
  const [cargoOpcoes, setCargoOpcoes] = useState<{ value: string; label: string }[]>([]);
  const [carregandoCargos, setCarregandoCargos] = useState(true);
  const [erroCargos, setErroCargos] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarCargos = async () => {
      setCargoOpcoes([]);
      setErroCargos(null);
      setCarregandoCargos(!!codigoUe);
      if (!codigoUe) return;

      try {
        const response = await fetchCargosDesignacoes(codigoUe);
        if (!ativo) return;

        if (response.success) {
          setCargoOpcoes(response.data.map((cargo) => ({
            value: cargo.codigoCargo === null ? 'TODOS' : String(cargo.codigoCargo),
            label: cargo.quantidade_designacoes > 0
              ? `${cargo.nomeCargo} (${cargo.quantidade_designacoes})`
              : cargo.nomeCargo,
          })));
        } else {
          setErroCargos(response.error);
        }
      } catch {
        if (ativo) setErroCargos('Erro ao buscar os cargos das designações');
      } finally {
        if (ativo) setCarregandoCargos(false);
      }
    };

    void carregarCargos();
    return () => { ativo = false; };
  }, [codigoUe]);
  const watchedValues = watch([
    "tipo",
    "periodo",
    "observacao",
    "status_publicacao",
    "cargo",
  ]);
  const hasFilters = watchedValues.some((v) => v !== undefined && v !== "" && v !== null && v !== "TODOS");
  return (
    <>
      <p className="text-[20px] font-bold pt-1 pb-1">Filtros</p>
      <p className="text-[14px] font-normal pt-1 pb-8">Utilize os filtros para refinar a sua busca.</p>

      <div className="w-full grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <TipoAtoSelectField label="Tipo de ato administrativo" AtosOpcoes={[{ codigo: 'TODOS', nome: 'Todos os atos' }, ...AtosOpcoes]} />
        </div>
        <div className="col-span-1">
          <DateRangePickerField
            register={register}
            control={control}
            name="periodo"
            label="Período"
            placeholder="Selecione um período"
          />
        </div>

        <div className="col-span-1">
          <InputField
            register={register}
            control={control}
            name="observacao"
            label="Buscar por observações"
            placeholder="Digite ..."
            data-testid="input-observacao"
            type="string"
          />
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-4">

        <div >
        <SelectField
            register={register}
            control={control}
            name="status_publicacao"
            label="Status"
            placeholder="Selecione"
            data-testid="select-status-publicacao"
            options={StatusPublicacaoOpcoes}
            showBlankSpace={false}
            disabled={false}           
          />
        </div>
        <div >
          <SelectField
            register={register}
            control={control}
            name="cargo"
            label="Cargo"
            placeholder="Selecione"
            data-testid="select-codigo-cargo-eol"
            options={cargoOpcoes}
            showBlankSpace={false}
            disabled={!codigoUe || carregandoCargos || !!erroCargos}
          />
          {erroCargos && <p role="alert" className="text-sm text-destructive">{erroCargos}</p>}
        </div>

      </div>


      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} />
    </>
  );
};

export default FiltroDeHistoricoDeAtosAdministrativos;
