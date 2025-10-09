import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import KpiTiles from '../components/KpiTiles';
import FitBreakdown from '../components/FitBreakdown';
import BudgetCoach from '../components/BudgetCoach';

interface SupplySnapshotResponse {
  matchCount: number;
  topFit: number;
  newSince: {
    since: string;
    count: number;
  };
  fit: {
    locationScore: number;
    featuresScore: number;
    lifestyleScore: number;
    price: {
      withinBudget: boolean;
      delta: number;
    };
  };
}

export default function WishlistDetail() {
  const { id = '' } = useParams();
  const [snapshot, setSnapshot] = useState<SupplySnapshotResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const data = await api.get<SupplySnapshotResponse>(`/wishlists/${id}/supply-snapshot`);
        if (!cancelled) {
          setSnapshot(data);
          setStatus('success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load supply snapshot');
          setStatus('error');
        }
      }
    }
    if (id) {
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  const tiles = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        id: 'match-count',
        label: 'Matching homes (owners): count only',
        value: snapshot.matchCount.toLocaleString(),
        description: 'Owners choose if/what to share. Numbers reflect anonymised demand.'
      },
      {
        id: 'top-fit',
        label: 'Top fit score',
        value: `${Math.round(snapshot.topFit)}%`,
        description: 'Location weighted highest. Improve requirements to raise this score.'
      },
      {
        id: 'new-since',
        label: `New owner interest since ${new Date(snapshot.newSince.since).toLocaleDateString()}`,
        value: snapshot.newSince.count,
        description: 'Aggregate view — details unlock only after a Home Profile share grant.'
      }
    ];
  }, [snapshot]);

  if (status === 'loading' || status === 'idle') {
    return <p role="status">Loading Wishlist review…</p>;
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>We couldn’t review this wishlist right now.</p>
        {error && <pre>{error}</pre>}
      </div>
    );
  }

  if (!snapshot) {
    return <p>No supply snapshot available yet. Check back soon.</p>;
  }

  return (
    <div className="wishlist-detail">
      <header>
        <h1>Review your Wishlist</h1>
        <p>Track how anonymised owner demand aligns with your goals — owners choose if/what to share until a Home Profile grant is issued.</p>
      </header>

      <KpiTiles tiles={tiles} />

      <FitBreakdown
        locationScore={snapshot.fit.locationScore}
        featuresScore={snapshot.fit.featuresScore}
        lifestyleScore={snapshot.fit.lifestyleScore}
        price={snapshot.fit.price}
      />

      <BudgetCoach wishlistId={id} />
    </div>
  );
}
