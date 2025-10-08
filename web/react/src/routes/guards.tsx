import { Navigate, Outlet } from 'react-router-dom';

export function RequireRole({ role, user }: { role: 'buyer' | 'seller' | 'agent'; user: any }) {
  if (user?.role !== role) return <Navigate to="/account" replace />;
  return <Outlet />;
}

export function ForbidSupplyForBuyer({ user }: { user: any }) {
  if (user?.role === 'buyer') return <Navigate to="/wishlists" replace />;
  return <Outlet />;
}
