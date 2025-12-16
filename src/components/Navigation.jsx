// Componentes de ícones SVG baseados nas imagens fornecidas
const HomeIcon = ({ isActive }) => {
  const color = isActive ? '#ffffff' : '#4f6d7a';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <rect x="18" y="8" width="3" height="4" rx="1" />
    </svg>
  );
};

const PlannerIcon = ({ isActive }) => {
  const color = isActive ? '#ffffff' : '#4f6d7a';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Notepad/Calendar base */}
      <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
      {/* Spiral binding dots */}
      <circle cx="6" cy="4" r="0.8" fill={color} />
      <circle cx="6" cy="5.5" r="0.8" fill={color} />
      <circle cx="6" cy="7" r="0.8" fill={color} />
      <circle cx="6" cy="8.5" r="0.8" fill={color} />
      <circle cx="6" cy="10" r="0.8" fill={color} />
      {/* Checkmark */}
      <path d="M9 13l2 2 4-4" strokeWidth="2.5" />
      {/* Pencil */}
      <path d="M16 19l3-3-3-3" strokeWidth="2" />
      <line x1="19" y1="16" x2="21" y2="14" strokeWidth="2" />
    </svg>
  );
};

const ChecklistIcon = ({ isActive }) => {
  const color = isActive ? '#ffffff' : '#4f6d7a';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Calendar/Notepad */}
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      {/* Spiral binding */}
      <circle cx="6" cy="4" r="1" fill={color} />
      <circle cx="6" cy="6" r="1" fill={color} />
      <circle cx="6" cy="8" r="1" fill={color} />
      <circle cx="6" cy="10" r="1" fill={color} />
      {/* Checkmark */}
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
};

const FoodIcon = ({ isActive }) => {
  const color = isActive ? '#ffffff' : '#4f6d7a';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Apple (left) */}
      <path d="M5 14c0-2.5 1.5-4 3-4s3 1.5 3 4-1.5 4-3 4-3-1.5-3-4z" />
      <path d="M6.5 11l0.5-1.5" />
      <path d="M7 9.5l0.3-0.3" />
      {/* Jar (center) */}
      <rect x="10.5" y="7" width="5" height="9" rx="1" />
      <line x1="10.5" y1="9" x2="15.5" y2="9" />
      <path d="M12.5 6.5h1v1h-1v-1z" />
      <path d="M13 6.5h0.5" />
      {/* Banana (right) */}
      <path d="M18 15c-0.5 1.5-1.5 2.5-2.5 2.5s-2-1-2-2.5c0-1.5 1-2.5 2-2.5s1.5 0 2.5 2.5z" />
      <path d="M17.5 14.5c0.3 0.5 0.5 1 0.5 1.5" />
    </svg>
  );
};

const ActivitiesIcon = ({ isActive }) => {
  const color = isActive ? '#ffffff' : '#4f6d7a';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Left shoe */}
      <path d="M3 19c0-1.5 1-2.5 2-2.5h2.5c1 0 2 1 2 2.5v1.5H3V19z" />
      <path d="M5.5 16.5h3.5" />
      <path d="M7 14l-1.5-1" />
      {/* Laces on left shoe */}
      <line x1="6" y1="15" x2="6" y2="16" />
      <line x1="7" y1="15" x2="7" y2="16" />
      <line x1="8" y1="15" x2="8" y2="16" />
      {/* Right shoe with screen */}
      <path d="M13 19c0-1.5 1-2.5 2-2.5h2.5c1 0 2 1 2 2.5v1.5h-6.5V19z" />
      <path d="M15.5 16.5h3.5" />
      {/* Screen/display on right shoe */}
      <rect x="15.5" y="13" width="4" height="3.5" rx="0.8" />
      {/* Heart icon in screen */}
      <path d="M17.5 14.5c0.2 0.2 0.5 0.2 0.7 0 0.2-0.2 0.5-0.2 0.7 0" fill={color} />
      {/* Simple lines for "tok" */}
      <line x1="17" y1="16.2" x2="18" y2="16.2" />
      <line x1="17" y1="16.8" x2="18.5" y2="16.8" />
    </svg>
  );
};

export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon },
    { id: 'planner', label: 'Planner', icon: PlannerIcon },
    { id: 'checklist', label: 'Checklist', icon: ChecklistIcon },
    { id: 'recipes-more', label: 'Alimentação', icon: FoodIcon },
    { id: 'activities', label: 'Atividades', icon: ActivitiesIcon }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-start px-0 py-2 max-w-full overflow-hidden">
        {navItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center px-1 py-2 rounded-lg transition-all flex-1 max-w-[20%] ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: '#4f6d7a' } : {}}
            >
              <div className="mb-1">
                <IconComponent isActive={isActive} />
              </div>
              <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

