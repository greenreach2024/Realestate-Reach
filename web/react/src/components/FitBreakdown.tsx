import type { FC } from 'react';

export interface FitBreakdownProps {
  locationScore: number; // 0-100 weighted highest
  featuresScore: number; // 0-100
  lifestyleScore: number; // 0-100
  price: {
    withinBudget: boolean;
    delta: number; // positive when over budget
  };
}

function clamp(score: number): number {
  if (Number.isNaN(score) || !Number.isFinite(score)) return 0;
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}

const WEIGHTS = {
  location: 0.45,
  features: 0.3,
  lifestyle: 0.25
};

function computeWeightedFit(props: FitBreakdownProps): number {
  if (!props.price.withinBudget) {
    return 0;
  }
  const score =
    clamp(props.locationScore) * WEIGHTS.location +
    clamp(props.featuresScore) * WEIGHTS.features +
    clamp(props.lifestyleScore) * WEIGHTS.lifestyle;
  return Math.round(score);
}

const FitBreakdown: FC<FitBreakdownProps> = ({ locationScore, featuresScore, lifestyleScore, price }) => {
  const weightedFit = computeWeightedFit({ locationScore, featuresScore, lifestyleScore, price });
  const priceStatus = price.withinBudget ? 'Within budget' : 'Over budget';

  return (
    <section aria-labelledby="fit-breakdown-heading" className="fit-breakdown">
      <header>
        <h2 id="fit-breakdown-heading">Fit breakdown</h2>
        <p className="fit-breakdown__summary">
          Overall fit: <strong>{weightedFit}%</strong>
        </p>
      </header>
      <dl className="fit-breakdown__list">
        <div>
          <dt>Location match</dt>
          <dd aria-label={`Location match ${clamp(locationScore)} percent`}>{clamp(locationScore)}%</dd>
        </div>
        <div>
          <dt>Features match</dt>
          <dd aria-label={`Features match ${clamp(featuresScore)} percent`}>{clamp(featuresScore)}%</dd>
        </div>
        <div>
          <dt>Lifestyle match</dt>
          <dd aria-label={`Lifestyle match ${clamp(lifestyleScore)} percent`}>{clamp(lifestyleScore)}%</dd>
        </div>
        <div>
          <dt>Budget gate</dt>
          <dd>
            <span className={price.withinBudget ? 'status-positive' : 'status-negative'}>{priceStatus}</span>
            {!price.withinBudget && (
              <small aria-live="polite">
                Over by ${Math.abs(price.delta).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </small>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default FitBreakdown;
