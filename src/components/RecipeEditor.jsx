import { useState } from 'react';

export default function RecipeEditor({ recipe, onSave, onCancel }) {
  const [formData, setFormData] = useState(recipe || {
    name: '',
    category: 'outros',
    prepTime: 15,
    portion: '1 porção',
    macros: { protein: 0, carbs: 0, fat: 0, kcal: 0 },
    ingredients: [],
    instructions: ''
  });
  const [newIngredient, setNewIngredient] = useState('');

  const categories = {
    sanduiche: 'Sanduíche',
    cuscuz: 'Cuscuz',
    frango: 'Frango',
    carne: 'Carne',
    outros: 'Outros'
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {recipe ? 'Editar Receita' : 'Nova Receita'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Receita
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Tempo e Porção */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo (min)
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porção
                </label>
                <input
                  type="text"
                  value={formData.portion}
                  onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Macros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Macros
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Proteína (g)</label>
                  <input
                    type="number"
                    value={formData.macros.protein}
                    onChange={(e) => setFormData({
                      ...formData,
                      macros: { ...formData.macros, protein: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Carbo (g)</label>
                  <input
                    type="number"
                    value={formData.macros.carbs}
                    onChange={(e) => setFormData({
                      ...formData,
                      macros: { ...formData.macros, carbs: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Gordura (g)</label>
                  <input
                    type="number"
                    value={formData.macros.fat}
                    onChange={(e) => setFormData({
                      ...formData,
                      macros: { ...formData.macros, fat: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Kcal</label>
                  <input
                    type="number"
                    value={formData.macros.kcal}
                    onChange={(e) => setFormData({
                      ...formData,
                      macros: { ...formData.macros, kcal: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredientes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                  placeholder="Adicionar ingrediente"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Instruções */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruções
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="4"
                required
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

