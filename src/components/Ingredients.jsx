import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

const DEFAULT_INGREDIENTS = {
  carbos: [
    { id: 'arroz', name: 'Arroz', icon: '🍚' },
    { id: 'feijao', name: 'Feijão', icon: '🫘' },
    { id: 'cuscuz', name: 'Cuscuz', icon: '🌾' },
    { id: 'pao-integral', name: 'Pão Integral', icon: '🍞' },
    { id: 'batata', name: 'Batata', icon: '🥔' },
    { id: 'batata-doce', name: 'Batata Doce', icon: '🍠' },
    { id: 'macarrao', name: 'Macarrão', icon: '🍝' }
  ],
  proteinas: [
    { id: 'frango-cubos', name: 'Frango em Cubos', icon: '🍗' },
    { id: 'frango-desfiado', name: 'Frango Desfiado', icon: '🍗' },
    { id: 'frango-empanado', name: 'Frango Empanado', icon: '🍗' },
    { id: 'sobrecoxa', name: 'Sobrecoxa', icon: '🍗' },
    { id: 'carne-moida', name: 'Carne Moída', icon: '🥩' },
    { id: 'ovos', name: 'Ovos', icon: '🥚' },
    { id: 'peixe', name: 'Peixe', icon: '🐟' },
    { id: 'atum', name: 'Atum', icon: '🐟' }
  ],
  saladas: [
    { id: 'alface', name: 'Alface', icon: '🥬' },
    { id: 'tomate', name: 'Tomate', icon: '🍅' },
    { id: 'cebola', name: 'Cebola', icon: '🧅' },
    { id: 'cenoura', name: 'Cenoura', icon: '🥕' },
    { id: 'beterraba', name: 'Beterraba', icon: '🍠' },
    { id: 'repolho', name: 'Repolho', icon: '🥬' },
    { id: 'pepino', name: 'Pepino', icon: '🥒' }
  ],
  frutas: [
    { id: 'maca', name: 'Maçã', icon: '🍎' },
    { id: 'uva', name: 'Uva', icon: '🍇' },
    { id: 'morango', name: 'Morango', icon: '🍓' },
    { id: 'manga', name: 'Manga', icon: '🥭' },
    { id: 'mamao', name: 'Mamão', icon: '🍈' },
    { id: 'banana', name: 'Banana', icon: '🍌' }
  ],
  adicionais: [
    { id: 'castanhas', name: 'Castanhas', icon: '🥜' },
    { id: 'nozes', name: 'Nozes', icon: '🌰' },
    { id: 'chocolate', name: 'Chocolate 70%', icon: '🍫' },
    { id: 'aveia', name: 'Aveia', icon: '🌾' }
  ]
};

const GROUP_LABELS = {
  carbos: 'Carboidratos',
  proteinas: 'Proteínas',
  saladas: 'Saladas',
  frutas: 'Frutas',
  adicionais: 'Adicionais'
};

export default function Ingredients() {
  const { data, updateData } = useStorage();
  const [newIngredient, setNewIngredient] = useState({ name: '', icon: '📝', group: 'carbos' });
  const [editingId, setEditingId] = useState(null);

  if (!data) return <div className="p-4">Carregando...</div>;

  // Carregar ingredientes salvos ou usar padrão
  const ingredients = data.ingredients || DEFAULT_INGREDIENTS;

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return;

    const updated = { ...data };
    if (!updated.ingredients) updated.ingredients = { ...DEFAULT_INGREDIENTS };

    const ingredient = {
      id: `ingredient-${Date.now()}`,
      name: newIngredient.name.trim(),
      icon: newIngredient.icon || '📝'
    };

    updated.ingredients[newIngredient.group].push(ingredient);
    updateData(updated);
    setNewIngredient({ name: '', icon: '📝', group: 'carbos' });
  };

  const handleDeleteIngredient = (group, index) => {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return;

    const updated = { ...data };
    updated.ingredients[group].splice(index, 1);
    updateData(updated);
  };

  const handleEditIngredient = (group, index, newData) => {
    const updated = { ...data };
    updated.ingredients[group][index] = { ...updated.ingredients[group][index], ...newData };
    updateData(updated);
    setEditingId(null);
  };

  const handleAddDefaults = () => {
    const updated = { ...data };
    updated.ingredients = { ...DEFAULT_INGREDIENTS };
    updateData(updated);
  };

  return (
    <div className="p-4 space-y-6 pb-20 overflow-x-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
        <button
          onClick={handleAddDefaults}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Restaurar Padrão
        </button>
      </div>

      {/* Adicionar novo ingrediente */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Adicionar Ingrediente</h2>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newIngredient.icon}
              onChange={(e) => setNewIngredient({ ...newIngredient, icon: e.target.value })}
              placeholder="Emoji"
              className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-xl flex-shrink-0"
              maxLength="2"
            />
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              placeholder="Nome do ingrediente"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
            />
            <select
              value={newIngredient.group}
              onChange={(e) => setNewIngredient({ ...newIngredient, group: e.target.value })}
              className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm flex-shrink-0"
            >
              {Object.entries(GROUP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleAddIngredient}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex-shrink-0"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Lista por grupo */}
      {Object.entries(GROUP_LABELS).map(([groupKey, groupLabel]) => {
        const groupIngredients = ingredients[groupKey] || [];
        if (groupIngredients.length === 0) return null;

        return (
          <div key={groupKey} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{groupLabel}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupIngredients.map((ingredient, idx) => {
                const editId = `${groupKey}-${idx}`;
                const isEditing = editingId === editId;

                return (
                  <div
                    key={ingredient.id || idx}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 min-w-0"
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={ingredient.icon}
                          onChange={(e) => handleEditIngredient(groupKey, idx, { icon: e.target.value })}
                          className="w-12 text-center text-lg border rounded flex-shrink-0"
                          maxLength="2"
                        />
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => handleEditIngredient(groupKey, idx, { name: e.target.value })}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs flex-shrink-0"
                        >
                          ✓
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xl flex-shrink-0">{ingredient.icon}</span>
                        <span className="flex-1 text-sm font-medium break-words min-w-0">{ingredient.name}</span>
                        <button
                          onClick={() => setEditingId(editId)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex-shrink-0 whitespace-nowrap"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(groupKey, idx)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex-shrink-0"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

