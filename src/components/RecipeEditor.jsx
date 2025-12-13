import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

export default function RecipeEditor({ recipe, onSave, onCancel }) {
  const { data } = useStorage();
  const [formData, setFormData] = useState(recipe || {
    name: '',
    category: 'outros',
    prepTime: 15,
    portion: '1 porção',
    ingredients: [], // Array de objetos { id, quantity, unit } ou strings (formato antigo)
    instructions: ''
  });
  const [newIngredient, setNewIngredient] = useState({ id: '', quantity: 1, unit: 'g' });

  const categories = {
    sanduiche: 'Sanduíche',
    cuscuz: 'Cuscuz',
    frango: 'Frango',
    carne: 'Carne',
    outros: 'Outros'
  };

  // Obter todos os ingredientes disponíveis
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

  // Normalizar ingredientes antigos (strings) para novo formato (objetos)
  const normalizeIngredients = (ingredients) => {
    return ingredients.map(ing => {
      if (typeof ing === 'string') {
        // Formato antigo: string
        const foundItem = allItems.find(item => item.name.toLowerCase() === ing.toLowerCase());
        return foundItem 
          ? { id: foundItem.id, quantity: 1, unit: foundItem.unit || 'g' }
          : { id: ing.toLowerCase().replace(/\s+/g, '-'), quantity: 1, unit: 'g', name: ing };
      }
      return ing; // Já está no formato novo
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.id) {
      const ingredient = allItems.find(item => item.id === newIngredient.id);
      if (ingredient) {
        setFormData({
          ...formData,
          ingredients: [...normalizeIngredients(formData.ingredients), {
            id: newIngredient.id,
            quantity: newIngredient.quantity || 1,
            unit: ingredient.unit || newIngredient.unit || 'g'
          }]
        });
        setNewIngredient({ id: '', quantity: 1, unit: 'g' });
      }
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: normalizeIngredients(formData.ingredients).filter((_, i) => i !== index)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
                  required
                />
              </div>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredientes
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                <select
                  value={newIngredient.id}
                  onChange={(e) => {
                    const selected = allItems.find(item => item.id === e.target.value);
                    setNewIngredient({
                      id: e.target.value,
                      quantity: newIngredient.quantity || 1,
                      unit: selected?.unit || 'g'
                    });
                  }}
                  className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
                >
                  <option value="">Selecione ingrediente</option>
                  {allItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.icon} {item.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseInt(e.target.value) || 1 })}
                  placeholder="Qtd"
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
                />
                <select
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
                >
                  <option value="g">g</option>
                  <option value="un">un</option>
                  <option value="porção">porção</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2 text-white rounded-lg"
                  style={{ backgroundColor: '#4f6d7a' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                  disabled={!newIngredient.id}
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {normalizeIngredients(formData.ingredients).map((ing, idx) => {
                  const ingredient = allItems.find(item => item.id === ing.id);
                  const displayName = ingredient ? `${ingredient.icon} ${ingredient.name}` : (ing.name || ing.id);
                  const currentQuantity = ing.quantity || 1;
                  const currentUnit = ing.unit || (ingredient?.unit || 'g');
                  
                  return (
                    <div
                      key={idx}
                      className="px-3 py-2 bg-[#eaeaea] rounded-lg text-sm flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex-shrink-0">{displayName}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <input
                            type="number"
                            value={currentQuantity}
                            onChange={(e) => {
                              const newIngredients = [...normalizeIngredients(formData.ingredients)];
                              newIngredients[idx] = { ...newIngredients[idx], quantity: parseInt(e.target.value) || 1 };
                              setFormData({ ...formData, ingredients: newIngredients });
                            }}
                            min="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <select
                            value={currentUnit}
                            onChange={(e) => {
                              const newIngredients = [...normalizeIngredients(formData.ingredients)];
                              newIngredients[idx] = { ...newIngredients[idx], unit: e.target.value };
                              setFormData({ ...formData, ingredients: newIngredients });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="g">g</option>
                            <option value="un">un</option>
                            <option value="porção">porção</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-[#dd6e42] hover:text-red-800 font-bold flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
                rows="4"
                required
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white rounded-lg font-medium"
                style={{ backgroundColor: '#4f6d7a' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
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


