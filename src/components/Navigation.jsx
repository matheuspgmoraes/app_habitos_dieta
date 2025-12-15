export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'planner', label: 'Planner' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'recipes-more', label: 'Alimentação' },
    { id: 'activities', label: 'Atividades' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center px-1 py-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-all min-h-[64px] w-full ${
              currentPage === item.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={currentPage === item.id ? { backgroundColor: '#4f6d7a' } : {}}
          >
            <span className="text-base font-medium leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

