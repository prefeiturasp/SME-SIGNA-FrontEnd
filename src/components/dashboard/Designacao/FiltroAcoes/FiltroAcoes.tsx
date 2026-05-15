import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import React from 'react';

interface Props {
  hasFilters: boolean;
  onClear?: () => void;
}

const FiltroAcoes: React.FC<Props> = ({ hasFilters, onClear }) => (
  <div className="flex justify-end gap-2 mt-4">
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      disabled={!hasFilters}
      onClick={onClear}
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
);

export default FiltroAcoes;
