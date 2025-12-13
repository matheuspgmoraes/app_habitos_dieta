import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

const DEFAULT_INGREDIENTS = {
  carbos: [
    { id: 'arroz', name: 'Arroz', icon: '🍚', unit: 'g' },
    { id: 'feijao', name: 'Feijão', icon: '🫘', unit: 'g' },
    { id: 'cuscuz', name: 'Cuscuz', icon: '🌾', unit: 'g' },
    { id: 'pao-integral', name: 'Pão Integral', icon: '🍞', unit: 'g' },
    { id: 'batata', name: 'Batata', icon: '🥔', unit: 'g' },
    { id: 'batata-doce', name: 'Batata Doce', icon: '🍠', unit: 'g' },
    { id: 'macarrao', name: 'Macarrão', icon: '🍝', unit: 'g' }
  ],
  proteinas: [
    { id: 'frango-cubos', name: 'Frango em Cubos', icon: '🍗', unit: 'g' },
    { id: 'frango-desfiado', name: 'Frango Desfiado', icon: '🍗', unit: 'g' },
    { id: 'frango-empanado', name: 'Frango Empanado', icon: '🍗', unit: 'g' },
    { id: 'sobrecoxa', name: 'Sobrecoxa', icon: '🍗', unit: 'g' },
    { id: 'carne-moida', name: 'Carne Moída', icon: '🥩', unit: 'g' },
    { id: 'ovos', name: 'Ovos', icon: '🥚', unit: 'un' },
    { id: 'peixe', name: 'Peixe', icon: '🐟', unit: 'g' },
    { id: 'atum', name: 'Atum', icon: '🐟', unit: 'g' }
  ],
  saladas: [
    { id: 'alface', name: 'Alface', icon: '🥬', unit: 'porção' },
    { id: 'tomate', name: 'Tomate', icon: '🍅', unit: 'porção' },
    { id: 'cebola', name: 'Cebola', icon: '🧅', unit: 'porção' },
    { id: 'cenoura', name: 'Cenoura', icon: '🥕', unit: 'porção' },
    { id: 'beterraba', name: 'Beterraba', icon: '🍠', unit: 'porção' },
    { id: 'repolho', name: 'Repolho', icon: '🥬', unit: 'porção' },
    { id: 'pepino', name: 'Pepino', icon: '🥒', unit: 'porção' }
  ],
  frutas: [
    { id: 'maca', name: 'Maçã', icon: '🍎', unit: 'un' },
    { id: 'uva', name: 'Uva', icon: '🍇', unit: 'un' },
    { id: 'morango', name: 'Morango', icon: '🍓', unit: 'un' },
    { id: 'manga', name: 'Manga', icon: '🥭', unit: 'un' },
    { id: 'mamao', name: 'Mamão', icon: '🍈', unit: 'un' },
    { id: 'banana', name: 'Banana', icon: '🍌', unit: 'un' }
  ],
  adicionais: [
    { id: 'castanhas', name: 'Castanhas', icon: '🥜', unit: 'g' },
    { id: 'nozes', name: 'Nozes', icon: '🌰', unit: 'g' },
    { id: 'chocolate', name: 'Chocolate 70%', icon: '🍫', unit: 'g' },
    { id: 'aveia', name: 'Aveia', icon: '🌾', unit: 'g' }
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
  const [newIngredient, setNewIngredient] = useState({ name: '', icon: '📝', group: 'carbos', unit: 'g' });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

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
      icon: newIngredient.icon || '📝',
      unit: newIngredient.unit || 'g'
    };

    updated.ingredients[newIngredient.group].push(ingredient);
    updateData(updated);
    setNewIngredient({ name: '', icon: '📝', group: 'carbos', unit: 'g' });
  };

  const handleDeleteIngredient = (group, index) => {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return;

    const updated = { ...data };
    updated.ingredients[group].splice(index, 1);
    updateData(updated);
  };

  const handleEditIngredient = (group, index, newData) => {
    // Atualizar dados de edição temporários
    const editId = `${group}-${index}`;
    setEditingData(prev => ({
      ...prev,
      [editId]: { ...prev[editId], ...newData }
    }));
  };

  const handleSaveIngredient = (group, index) => {
    const editId = `${group}-${index}`;
    const editedData = editingData[editId];
    if (!editedData) {
      setEditingId(null);
      return;
    }

    const updated = { ...data };
    if (!updated.ingredients) {
      updated.ingredients = { ...DEFAULT_INGREDIENTS };
    }
    // Criar uma cópia do array para garantir que o React detecte a mudança
    const groupArray = [...(updated.ingredients[group] || [])];
    groupArray[index] = { ...groupArray[index], ...editedData };
    updated.ingredients[group] = groupArray;
    updateData(updated);
    
    // Limpar dados de edição e fechar modo de edição
    const newEditingData = { ...editingData };
    delete newEditingData[editId];
    setEditingData(newEditingData);
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
          className="px-3 py-1 text-white rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#4f6d7a' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
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
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm flex-shrink-0"
            >
              <option value="g">Gramas (g)</option>
              <option value="un">Unidade (un)</option>
              <option value="porção">Porção</option>
            </select>
            <button
              onClick={handleAddIngredient}
              className="px-4 py-2 text-white rounded-lg font-medium flex-shrink-0"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
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
                const currentEditing = editingData[editId] || {};
                const displayIngredient = isEditing 
                  ? { ...ingredient, ...currentEditing }
                  : ingredient;

                return (
                  <div
                    key={ingredient.id || idx}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 min-w-0"
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={displayIngredient.icon || ''}
                          onChange={(e) => handleEditIngredient(groupKey, idx, { icon: e.target.value })}
                          className="w-12 text-center text-lg border rounded flex-shrink-0"
                          maxLength="2"
                        />
                        <input
                          type="text"
                          value={displayIngredient.name || ''}
                          onChange={(e) => handleEditIngredient(groupKey, idx, { name: e.target.value })}
                          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select
                          value={displayIngredient.unit || 'g'}
                          onChange={(e) => handleEditIngredient(groupKey, idx, { unit: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-xs flex-shrink-0"
                        >
                          <option value="g">g</option>
                          <option value="un">un</option>
                          <option value="porção">porção</option>
                        </select>
                        <button
                          onClick={() => handleSaveIngredient(groupKey, idx)}
                          className="px-2 py-1 text-white rounded text-xs flex-shrink-0"
                          style={{ backgroundColor: '#4f6d7a' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                        >
                          ✓
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xl flex-shrink-0">{ingredient.icon}</span>
                        <span className="flex-1 text-sm font-medium break-words min-w-0">{ingredient.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">({ingredient.unit || 'g'})</span>
                        <button
                          onClick={() => {
                            setEditingData(prev => ({
                              ...prev,
                              [editId]: { ...ingredient }
                            }));
                            setEditingId(editId);
                          }}
                          className="px-2 py-1 text-white rounded text-xs flex-shrink-0 whitespace-nowrap"
                          style={{ backgroundColor: '#4f6d7a' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(groupKey, idx)}
                          className="px-2 py-1 text-white rounded text-xs flex-shrink-0"
                          style={{ backgroundColor: '#dd6e42' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#c55a2e'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#dd6e42'}
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

