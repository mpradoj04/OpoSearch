import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const IconHome = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
		<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
		<path d="M9 21V12h6v9" />
	</svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

interface NavItem {
	icon: React.ReactNode;
	label: string,
	href: string;
	authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
	// { icon: <IconHome />, label: "Inicio", href: "/search" },
	// { icon: <IconUser />, label: "Perfil", href: "/profile", authRequired: true },
	{ icon: <IconSearch />, label: "Búsqueda", href: "/search", authRequired: true },
]

function NavItemComponent({
	item,
	active,
	isAuthenticated,
  isLoading,
}: {
	item: NavItem;
	active: boolean;
	isAuthenticated: boolean;
  isLoading: boolean;
}) {
	const href = item.authRequired && !isAuthenticated && !isLoading ? "/login" : item.href;
	const label = item.authRequired && !isAuthenticated ? "Acceder" : item.label;

	return (
		<Link to={href} className={"no-underline"}>
			<div
				title={label}
				className={[
          "relative flex items-center justify-center",
          "min-h-[44px] rounded-[3px] px-3 py-2.5",
          "border cursor-pointer overflow-hidden whitespace-nowrap",
          "transition-all duration-150",
          active
            ? "nb-item--active border-[var(--gold)] bg-[var(--accent-bg)] text-[var(--gold)]"
            : "border-transparent text-[var(--text-muted)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--gold-light)]",
        ].join(" ")}
      >
        <span className="flex items-center justify-center w-5 h-5 shrink-0">
          {item.icon}
        </span>
			{active && <span className="nb-indicator" />}
      </div>
    </Link>
  );
}

export function SideBar() {
	const location = useLocation();
	const { isAuthenticated, isLoading  } = useAuth();

	return (
		<>
      <style>{`
        .nb-sidebar::after {
          content: '';
          position: absolute;
          top: 20%; bottom: 20%; right: 0;
          width: 1px;
          background: linear-gradient(180deg,
            transparent 0%,
            var(--accent-border) 40%,
            var(--accent-border) 60%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .nb-sidebar:hover::after { opacity: 1; }
 
        .nb-indicator {
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          border-radius: 0 2px 2px 0;
          background: var(--gold);
        }
      `}</style>

			<nav className="nb-sidebar ..." style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "64px" }}>

				{/* ─── logo ─── */}
        <div className="flex items-center justify-center min-h-[72px] px-3 py-4 border-b border-[var(--border)] shrink-0">
          <img
            src="/LogoCBD_sinfondo.png"
            alt="Oposearch"
            className="w-10 h-10 object-contain"
          />
        </div>

				{/* ─── nav items ─── */}
        <div className="flex flex-col flex-1 gap-0.5 px-2 py-4 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              active={
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href)
              }
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          ))}
        </div>

				 {/* ─── ornamento dorado ─── */}
        <div className="flex justify-center py-2 shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--gold-dark)] opacity-50">
            <path d="M12 2l1.5 4.5H18l-3.75 2.75 1.5 4.5L12 11 8.25 13.75l1.5-4.5L6 6.5h4.5L12 2z" />
          </svg>
        </div>

			</nav>
		</>
	)
}