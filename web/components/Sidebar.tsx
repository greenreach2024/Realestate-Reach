import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

type Role = 'buyer' | 'seller' | 'agent';

type Item = {
  to: string;
  label: string;
  icon: JSX.Element;
  roles: Role[];
};

const NAV_ITEMS: Item[] = [
  { to: '/wishlists', label: 'Wishlists', icon: <i className="i-wishlist" aria-hidden />, roles: ['buyer'] },
  { to: '/budget-coach', label: 'Budget Coach', icon: <i className="i-trend" aria-hidden />, roles: ['buyer'] },
  { to: '/messages', label: 'Messages', icon: <i className="i-chat" aria-hidden />, roles: ['buyer', 'seller', 'agent'] },
  { to: '/account', label: 'Account & Privacy', icon: <i className="i-user" aria-hidden />, roles: ['buyer'] },
  { to: '/homes', label: 'My Homes', icon: <i className="i-home" aria-hidden />, roles: ['seller'] },
  { to: '/buyer-matches', label: 'Buyer Matches', icon: <i className="i-target" aria-hidden />, roles: ['seller'] },
  { to: '/insights', label: 'Insights', icon: <i className="i-analytics" aria-hidden />, roles: ['seller', 'agent'] },
  { to: '/analytics/demand', label: 'Demand Analytics', icon: <i className="i-heatmap" aria-hidden />, roles: ['agent'] },
  { to: '/segments', label: 'Buyer Segments', icon: <i className="i-segments" aria-hidden />, roles: ['agent'] },
  { to: '/agents/homes', label: 'My Sellers & Homes', icon: <i className="i-portfolio" aria-hidden />, roles: ['agent'] },
  { to: '/billing', label: 'Billing & Licenses', icon: <i className="i-billing" aria-hidden />, roles: ['seller', 'agent'] },
];

const NEW_LABELS: Record<Role, string> = {
  buyer: 'New Wishlist',
  seller: 'New Home',
  agent: 'New Segment',
};

export interface SidebarProps {
  role: Role;
  availableRoles?: Role[];
  unreadMessages?: number;
  collapsed?: boolean;
  drawer?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onRoleChange?: (role: Role) => void;
  onNew?: (role: Role) => void;
}

export function Sidebar({
  role,
  availableRoles = ['buyer'],
  unreadMessages = 0,
  collapsed = false,
  drawer = false,
  onCollapseChange,
  onRoleChange,
  onNew,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(Boolean(collapsed));
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => setInternalCollapsed(Boolean(collapsed)), [collapsed]);

  const items = useMemo(() => NAV_ITEMS.filter((item) => item.roles.includes(role)), [role]);

  useEffect(() => {
    const list = navRef.current;
    if (!list) return;
    const handleKey = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName.toLowerCase() !== 'a') return;
      const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('a[data-sidebar-item]'));
      const index = links.findIndex((link) => link === target);
      if (index === -1 || links.length === 0) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowDown') {
        nextIndex = (index + 1) % links.length;
      } else if (event.key === 'ArrowUp') {
        nextIndex = (index - 1 + links.length) % links.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = links.length - 1;
      }
      links[nextIndex]?.focus();
    };
    list.addEventListener('keydown', handleKey as EventListener);
    return () => list.removeEventListener('keydown', handleKey as EventListener);
  }, [items]);

  const classNames = ['sidebar'];
  if (internalCollapsed) {
    classNames.push('sidebar--collapsed');
  } else {
    classNames.push('sidebar--expanded');
  }
  if (drawer) {
    classNames.push('sidebar--drawer');
  }

  const handleToggle = () => {
    const nextCollapsed = !internalCollapsed;
    setInternalCollapsed(nextCollapsed);
    onCollapseChange?.(nextCollapsed);
  };

  const handleNewClick = () => {
    onNew?.(role);
  };

  const newLabel = NEW_LABELS[role];

  return (
    <nav aria-label="Primary" className={classNames.join(' ')}>
      <div className="sidebar__header">
        <div className="sidebar__brand">Buyer Registry</div>
        <button
          type="button"
          className="sidebar__pin"
          aria-pressed={!internalCollapsed}
          onClick={handleToggle}
          title={internalCollapsed ? 'Pin sidebar' : 'Collapse sidebar'}
        >
          {internalCollapsed ? '📍' : '📌'}
        </button>
      </div>
      <div className="sidebar__actions">
        <button type="button" className="primary-button sidebar__new" onClick={handleNewClick}>
          {newLabel}
        </button>
      </div>
      <ul className="sidebar__list" ref={navRef}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              data-sidebar-item
              className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
              title={item.label}
            >
              {item.icon}
              <span className="sidebar__label">{item.label}</span>
              {item.label === 'Messages' && unreadMessages > 0 ? (
                <span className="sidebar__badge">{unreadMessages}</span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
      {availableRoles.length > 1 && (
        <footer className="sidebar__footer">
          <label className="role-switcher">
            <span>Role</span>
            <select value={role} onChange={(event) => onRoleChange?.(event.target.value as Role)}>
              {availableRoles.map((option) => (
                <option value={option} key={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </footer>
      )}
    </nav>
  );
}
