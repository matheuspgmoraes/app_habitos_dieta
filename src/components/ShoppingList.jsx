import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

const DEFAULT_CATEGORIES = {
  proteinas: 'Proteínas',
  carbos: 'Carboidratos',
  frutas: 'Frutas',
  legumes: 'Legumes',
  saladas: 'Saladas',
  adicionais: 'Adicionais'
};

const DEFAULT_ITEMS = {
  proteinas: ['Frango', 'Carne moída', 'Ovos'],
  carbos: ['Arroz', 'Feijão', 'Cuscuz', 'Pão integral'],
  frutas: ['Maçã', 'Uva', 'Morango', 'Manga', 'Mamão'],
  legumes: ['Cenoura', 'Beterraba'],
  saladas: ['Alface', 'Tomate', 'Cebola', 'Repolho'],
  adicionais: ['Castanhas', 'Nozes', 'Chocolate 70%', 'Aveia']
};

export default function ShoppingList() {
  const { data, updateShoppingList, addToShoppingList, clearCheckedItems } = useStorage();
  const [newItem, setNewItem] = useState({ name: '', category: 'proteinas' });

  if (!data) return <div className="p-4">Carregando...</div>;

  const shoppingList = data.shoppingList || [];

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      addToShoppingList({
        name: newItem.name.trim(),
        category: newItem.category
      });
      setNewItem({ name: '', category: 'proteinas' });
    }
  };

  const handleToggle = (index) => {
    updateShoppingList(index, !shoppingList[index].checked);
  };

  const itemsByCategory = {};
  shoppingList.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  // Adicionar itens padrão que não estão na lista
  const addDefaultItems = () => {
    Object.entries(DEFAULT_ITEMS).forEach(([category, items]) => {
      items.forEach(itemName => {
        if (!shoppingList.find(i => i.name.toLowerCase() === itemName.toLowerCase())) {
          addToShoppingList({ name: itemName, category });
        }
      });
    });
  };

  const hasCheckedItems = shoppingList.some(item => item.checked);

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>

      {/* Adicionar item */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Adicionar Item</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Nome do item"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {Object.entries(DEFAULT_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Adicionar
            </button>
            <button
              onClick={addDefaultItems}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
            >
              Itens Padrão
            </button>
          </div>
        </div>
      </div>

      {/* Lista por categoria */}
      {Object.entries(DEFAULT_CATEGORIES).map(([categoryKey, categoryLabel]) => {
        const items = itemsByCategory[categoryKey] || [];
        if (items.length === 0) return null;

        return (
          <div key={categoryKey} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">{categoryLabel}</h2>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const globalIndex = shoppingList.findIndex(i => i.name === item.name && i.category === item.category);
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggle(globalIndex)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                      item.checked
                        ? 'bg-green-50 border-green-500 text-green-900 line-through'
                        : 'bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      item.checked
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400'
                    }`}>
                      {item.checked && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {hasCheckedItems && (
        <button
          onClick={clearCheckedItems}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Limpar Itens Marcados
        </button>
      )}

      {shoppingList.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Lista vazia. Adicione itens acima ou use "Itens Padrão" para começar.
        </div>
      )}
    </div>
  );
}

