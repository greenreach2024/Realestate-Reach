import type { FC, ReactNode } from 'react';

export interface KpiTileConfig {
  id: string;
  label: string;
  value: ReactNode;
  description?: string;
}

interface KpiTilesProps {
  tiles: KpiTileConfig[];
}

const KpiTiles: FC<KpiTilesProps> = ({ tiles }) => {
  if (!tiles.length) return null;

  return (
    <section aria-label="Wishlist review metrics" className="kpi-tiles">
      <ul>
        {tiles.map((tile) => (
          <li key={tile.id}>
            <p className="kpi-tiles__label">{tile.label}</p>
            <p className="kpi-tiles__value">{tile.value}</p>
            {tile.description && <small className="kpi-tiles__description">{tile.description}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default KpiTiles;
