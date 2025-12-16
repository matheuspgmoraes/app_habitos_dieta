export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'planner', label: 'Planner' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'recipes-more', label: 'Alimentação' },
    { id: 'activities', label: 'Atividades' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center px-0 py-3 max-w-full overflow-hidden">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center px-1 py-2 rounded-lg transition-all min-h-[56px] flex-1 max-w-[20%] ${
              currentPage === item.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={currentPage === item.id ? { backgroundColor: '#4f6d7a' } : {}}
          >
            <span className="text-xs font-medium leading-tight text-center break-words">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

