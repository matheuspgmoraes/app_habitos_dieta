import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import RecipeEditor from './RecipeEditor';

export default function Recipes() {
  const { data, addRecipe, updateRecipe, deleteRecipe } = useStorage();
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
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
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-red-50 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Proteína</div>
                    <div className="text-sm font-bold text-red-600">{recipe.macros.protein}g</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Carbo</div>
                    <div className="text-sm font-bold text-blue-600">{recipe.macros.carbs}g</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Gordura</div>
                    <div className="text-sm font-bold text-yellow-600">{recipe.macros.fat}g</div>
                  </div>
                  <div className="bg-green-50 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Kcal</div>
                    <div className="text-sm font-bold text-green-600">{recipe.macros.kcal}</div>
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
                  <p className="text-sm text-gray-600 break-words">{recipe.ingredients.join(', ')}</p>
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

