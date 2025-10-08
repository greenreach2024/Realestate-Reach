import { FormEvent, useState } from 'react';
import api from '../../api/client';

export interface ShareWithBuyerFormProps {
  homeId: string;
  buyerId: string;
  defaultScope?: {
    profile?: boolean;
    photos?: boolean;
    address?: boolean;
  };
  onShared?: () => void;
}

interface ShareRequestBody {
  buyerId: string;
  scope: {
    profile: boolean;
    photos: boolean;
    address: boolean;
  };
  expiresAt: string | null;
}

export default function ShareWithBuyerForm({
  homeId,
  buyerId,
  defaultScope = { profile: true, photos: true, address: false },
  onShared
}: ShareWithBuyerFormProps) {
  const [scope, setScope] = useState({
    profile: Boolean(defaultScope.profile),
    photos: Boolean(defaultScope.photos),
    address: Boolean(defaultScope.address)
  });
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    const payload: ShareRequestBody = {
      buyerId,
      scope,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
    };

    try {
      await api.post(`/homes/${homeId}/shares`, payload);
      setStatus('success');
      onShared?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to share Home Profile');
      setStatus('error');
    }
  }

  return (
    <form className="share-with-buyer" onSubmit={handleSubmit} aria-describedby="share-with-buyer-helptext">
      <p id="share-with-buyer-helptext" className="share-with-buyer__intro">
        Share Home Profile with this buyer. You control what’s shared and can revoke anytime.
      </p>

      <fieldset disabled={status === 'submitting'}>
        <legend>Scope</legend>
        <label>
          <input
            type="checkbox"
            checked={scope.profile}
            onChange={(event) => setScope((prev) => ({ ...prev, profile: event.target.checked }))}
          />
          Home profile
        </label>
        <label>
          <input
            type="checkbox"
            checked={scope.photos}
            onChange={(event) => setScope((prev) => ({ ...prev, photos: event.target.checked }))}
          />
          Photos
        </label>
        <label>
          <input
            type="checkbox"
            checked={scope.address}
            onChange={(event) => setScope((prev) => ({ ...prev, address: event.target.checked }))}
          />
          Address
        </label>
      </fieldset>

      <label className="share-with-buyer__expires">
        Share expires on (optional)
        <input
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </label>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sharing…' : 'Share Home Profile'}
      </button>

      {status === 'error' && error && (
        <p role="alert" className="share-with-buyer__error">
          {error}
        </p>
      )}
      {status === 'success' && <p className="share-with-buyer__success">Home Profile shared successfully.</p>}
    </form>
  );
}
