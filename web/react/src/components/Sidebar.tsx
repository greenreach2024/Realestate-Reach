import { KeyboardEvent, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

type Role = 'buyer' | 'seller' | 'agent';

export interface SidebarProps {
  role: Role;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  roles: Role[];
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'wishlists', label: 'Wishlists', href: '/wishlists', roles: ['buyer'], icon: '📝' },
  { id: 'budget', label: 'Budget Coach', href: '/budget-coach', roles: ['buyer'], icon: '💡' },
  { id: 'messages', label: 'Messages', href: '/messages', roles: ['buyer', 'seller', 'agent'], icon: '💬' },
  { id: 'account', label: 'Account', href: '/account', roles: ['buyer', 'seller', 'agent'], icon: '👤' },
  { id: 'homes', label: 'Home Portfolio', href: '/homes', roles: ['seller', 'agent'], icon: '🏠' },
  { id: 'buyers', label: 'Buyers', href: '/buyers', roles: ['seller', 'agent'], icon: '🤝' }
];

function filterNav(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

function useCollapsedState(): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void] {
  const initial = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)').matches : false;
  const [collapsed, setCollapsed] = useState<boolean>(initial);
  return [collapsed, setCollapsed];
}

export default function Sidebar({ role }: SidebarProps) {
  const items = useMemo(() => filterNav(role), [role]);
  const [isCollapsed, setIsCollapsed] = useCollapsedState();

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsCollapsed((prev) => !prev);
    }
  }

  return (
    <aside className={isCollapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <button
        type="button"
        className="sidebar__toggle"
        aria-expanded={!isCollapsed}
        aria-controls="primary-sidebar-nav"
        onClick={() => setIsCollapsed((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        {isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
      </button>
      <nav aria-label="Primary" id="primary-sidebar-nav">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <NavLink to={item.href} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                <span className="sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
