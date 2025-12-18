export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'planner', label: 'Planner' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'recipes-more', label: 'Alimentação' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-start px-0 py-4 max-w-full overflow-hidden">
        {navItems.map(item => {
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
              <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
