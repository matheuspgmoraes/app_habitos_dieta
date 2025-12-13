import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import RecipeEditor from './RecipeEditor';

export default function Recipes() {
  const { data, addRecipe, updateRecipe, deleteRecipe } = useStorage();
  
  // Obter todos os ingredientes disponíveis para exibição
  const allIngredients = data?.ingredients || {
    carbos: [],
    proteinas: [],
    saladas: [],
    frutas: [],
    adicionais: []
  };
  const allItems = [
    ...(allIngredients.carbos || []),
    ...(allIngredients.proteinas || []),
    ...(allIngredients.saladas || []),
    ...(allIngredients.frutas || []),
    ...(allIngredients.adicionais || [])
  ];
  
  // Função para normalizar ingredientes (suporta formato antigo e novo)
  const normalizeIngredients = (ingredients) => {
    return ingredients.map(ing => {
      if (typeof ing === 'string') {
        return { id: ing.toLowerCase().replace(/\s+/g, '-'), quantity: 1, unit: 'g', name: ing };
      }
      return ing;
    });
  };
  
  // Função para obter nome do ingrediente
  const getIngredientName = (ing) => {
    if (typeof ing === 'string') {
      return ing;
    }
    const item = allItems.find(i => i.id === ing.id);
    return item ? `${item.icon} ${item.name} (${ing.quantity}${ing.unit || 'g'})` : (ing.name || ing.id);
  };
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  if (!data) return <div className="p-4">Carregando...</div>;

  const categories = {
    sanduiche: 'Sanduíches',
    cuscuz: 'Cuscuz Proteico',
    frango: 'Frango',
    carne: 'Carne',
    outros: 'Outros'
  };

  const recipesByCategory = {};
  data.recipes.forEach(recipe => {
    if (!recipesByCategory[recipe.category]) {
      recipesByCategory[recipe.category] = [];
    }
    recipesByCategory[recipe.category].push(recipe);
  });

  const handleSave = (recipeData) => {
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, recipeData);
    } else {
      addRecipe(recipeData);
    }
    setShowEditor(false);
    setEditingRecipe(null);
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowEditor(true);
  };

  const handleDelete = (recipeId) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      deleteRecipe(recipeId);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20 overflow-x-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
        <button
          onClick={() => {
            setEditingRecipe(null);
            setShowEditor(true);
          }}
          className="px-4 py-2 text-white rounded-lg font-medium"
          style={{ backgroundColor: '#4f6d7a' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
        >
          + Nova Receita
        </button>
      </div>

      {showEditor && (
        <RecipeEditor
          recipe={editingRecipe}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {Object.entries(recipesByCategory).map(([category, recipes]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">{categories[category]}</h2>
          <div className="space-y-4">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 break-words flex-1">{recipe.name}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="px-3 py-1 text-white rounded text-sm whitespace-nowrap"
                      style={{ backgroundColor: '#4f6d7a' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-3 py-1 text-white rounded text-sm whitespace-nowrap"
                      style={{ backgroundColor: '#dd6e42' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c55a2e'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#dd6e42'}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  <span>⏱️ {recipe.prepTime}min</span>
                  <span>🍽️ {recipe.portion}</span>
                </div>

                {/* Ingredientes */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Ingredientes:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {normalizeIngredients(recipe.ingredients || []).map((ing, idx) => {
                      const item = allItems.find(i => i.id === ing.id);
                      const displayName = item ? `${item.icon} ${item.name}` : (ing.name || ing.id);
                      const quantity = ing.quantity || 1;
                      const unit = ing.unit || (item?.unit || 'g');
                      return (
                        <li key={idx} className="text-sm text-gray-600">
                          <span className="font-medium">{quantity}{unit}</span> - {displayName}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Instruções */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Instruções:</h4>
                  <p className="text-sm text-gray-600 break-words">{recipe.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

