import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

interface SharedHomeResponse {
  id: string;
  name: string;
  address?: string | null;
  area?: string | null;
  photos?: string[];
  description?: string;
  highlights?: string[];
}

export default function SharedHome() {
  const { homeId = '' } = useParams();
  const [home, setHome] = useState<SharedHomeResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await api.get<SharedHomeResponse>(`/shared/homes/${homeId}`);
        if (!cancelled) {
          setHome(data);
          setStatus('success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load shared home');
          setStatus('error');
        }
      }
    }

    if (homeId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [homeId]);

  if (status === 'loading' || status === 'idle') {
    return <p role="status">Loading shared Home Profile…</p>;
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>This Home Profile isn’t available right now.</p>
        {error && <pre>{error}</pre>}
      </div>
    );
  }

  if (!home) {
    return <p>No shared data for this home yet.</p>;
  }

  const address = home.address ?? 'Address hidden — owner hasn’t shared this yet.';
  const photos = home.photos ?? [];

  return (
    <article className="shared-home" aria-labelledby="shared-home-title">
      <header>
        <h1 id="shared-home-title">{home.name}</h1>
        <p className="shared-home__address">{address}</p>
        {home.area && <p className="shared-home__area">{home.area}</p>}
      </header>

      {photos.length > 0 ? (
        <section aria-label="Home photos" className="shared-home__photos">
          <ul>
            {photos.map((photoUrl) => (
              <li key={photoUrl}>
                <img src={photoUrl} alt="Shared home" loading="lazy" />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="shared-home__photos--empty">Photos will appear when the owner shares them.</p>
      )}

      {home.description && (
        <section aria-label="Home description" className="shared-home__description">
          <p>{home.description}</p>
        </section>
      )}

      {home.highlights && home.highlights.length > 0 && (
        <section aria-label="Highlights" className="shared-home__highlights">
          <h2>Highlights</h2>
          <ul>
            {home.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
