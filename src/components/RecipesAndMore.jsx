import { useState } from 'react';
import Recipes from './Recipes';
import Ingredients from './Ingredients';
import ShoppingList from './ShoppingList';
import WeeklyPrep from './WeeklyPrep';

export default function RecipesAndMore() {
  const [activeSection, setActiveSection] = useState('recipes');

  const sections = [
    { id: 'recipes', label: 'Receitas', icon: '🍽️', component: Recipes },
    { id: 'ingredients', label: 'Ingredientes', icon: '🥘', component: Ingredients },
    { id: 'prep', label: 'Preparo', icon: '👨‍🍳', component: WeeklyPrep },
    { id: 'shopping', label: 'Compras', icon: '🛒', component: ShoppingList }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || Recipes;

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Navegação de seções */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex overflow-x-hidden">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-2 py-3 text-center font-medium transition-all border-b-2 ${
                activeSection === section.id
                  ? 'bg-green-50 text-green-700 border-green-600'
                  : 'text-gray-600 border-transparent hover:bg-gray-50'
              }`}
            >
              <span className="text-lg block mb-1">{section.icon}</span>
              <span className="text-xs">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da seção ativa */}
      <div className="overflow-x-hidden">
        <ActiveComponent />
      </div>
    </div>
  );
}

