import { Route, Routes, useParams } from 'react-router-dom';
import { ForbidSupplyForBuyer, RequireRole } from './guards';
import WishlistDetail from '../pages/WishlistDetail';
import SharedHome from '../pages/SharedHome';
import ShareWithBuyerForm from '../features/shares/ShareWithBuyerForm';
import Sidebar from '../components/Sidebar';

interface AppRoutesProps {
  user: { id: string; role: 'buyer' | 'seller' | 'agent' } | null;
}

function ShareWithBuyerRoute() {
  const params = useParams<{ homeId: string; buyerId: string }>();
  const homeId = params.homeId ?? '';
  const buyerId = params.buyerId ?? '';
  return <ShareWithBuyerForm homeId={homeId} buyerId={buyerId} />;
}

export default function AppRoutes({ user }: AppRoutesProps) {
  return (
    <div className="app-layout">
      {user && <Sidebar role={user.role} />}
      <main>
        <Routes>
          <Route element={<RequireRole role="buyer" user={user} />}>
            <Route path="/wishlists/:id" element={<WishlistDetail />} />
            <Route path="/wishlists" element={<p>Select a wishlist to view insights.</p>} />
            <Route path="/budget-coach" element={<p>Budget Coach</p>} />
            <Route path="/messages" element={<p>Buyer messages</p>} />
          </Route>

          <Route element={<ForbidSupplyForBuyer user={user} />}>
            <Route path="/homes/:homeId/share/:buyerId" element={<ShareWithBuyerRoute />} />
            <Route path="/homes/*" element={<p>Seller workspace</p>} />
          </Route>

          <Route path="/shared/homes/:homeId" element={<SharedHome />} />
          <Route path="/account" element={<p>Account overview</p>} />
        </Routes>
      </main>
    </div>
  );
}
