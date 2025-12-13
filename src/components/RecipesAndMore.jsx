import { useState } from 'react';
import Recipes from './Recipes';
import Ingredients from './Ingredients';
import ShoppingList from './ShoppingList';
import WeeklyPrep from './WeeklyPrep';
import GenerateShoppingList from './GenerateShoppingList';

export default function RecipesAndMore() {
  const [activeSection, setActiveSection] = useState('recipes');

  const sections = [
    { id: 'recipes', label: 'Receitas', component: Recipes },
    { id: 'ingredients', label: 'Ingredientes', component: Ingredients },
    { id: 'prep', label: 'Preparo', component: WeeklyPrep },
    { id: 'shopping', label: 'Compras', component: ShoppingList },
    { id: 'generate', label: 'Gerar Lista', component: GenerateShoppingList }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || Recipes;

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Navegação de seções */}
      <div className="sticky top-0 bg-white border-b border-[#eaeaea] z-10">
        <div className="flex overflow-x-hidden">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-2 py-3 text-center font-medium transition-all border-b-2 ${
                activeSection === section.id
                  ? 'bg-[#c0d6df] text-[#4f6d7a] border-[#dd6e42]'
                  : 'text-gray-600 border-transparent hover:bg-[#eaeaea]'
              }`}
            >
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

