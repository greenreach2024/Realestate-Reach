import type { FC } from 'react';

export interface BudgetCoachProps {
  wishlistId: string;
  onAdjustBudget?: () => void;
}

const BudgetCoach: FC<BudgetCoachProps> = ({ wishlistId, onAdjustBudget }) => (
  <section aria-labelledby="budget-coach-heading" className="budget-coach">
    <h2 id="budget-coach-heading">Budget Coach</h2>
    <p>
      Keep your wishlist competitive by balancing budget, must-have features, and lifestyle goals. The Budget Coach analyses
      market shifts nightly and recommends adjustments when anonymised fit drifts.
    </p>
    <button type="button" onClick={onAdjustBudget} className="budget-coach__cta">
      Adjust budget for wishlist {wishlistId}
    </button>
  </section>
);

export default BudgetCoach;
