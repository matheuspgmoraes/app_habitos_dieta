export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'planner', label: 'Planner', icon: '📅' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'recipes-more', label: 'Receitas & Mais', icon: '🍽️' },
    { id: 'activities', label: 'Atividades', icon: '🏃' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              currentPage === item.id
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

