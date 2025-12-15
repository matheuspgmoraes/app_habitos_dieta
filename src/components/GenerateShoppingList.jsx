import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import jsPDF from 'jspdf';

// Conversão de carnes: cozido para cru (aproximadamente 30% de perda)
const MEAT_CONVERSION = {
  'frango-cubos': 1.43, // 100g cozido = 143g cru
  'frango-desfiado': 1.43,
  'frango-empanado': 1.43,
  'sobrecoxa': 1.43,
  'carne-moida': 1.43,
  'ovos': 1.0 // Ovos não precisam conversão
};

export default function GenerateShoppingList() {
  const { data } = useStorage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shoppingList, setShoppingList] = useState({});

  if (!data) return <div className="p-4">Carregando...</div>;

  // Obter todos os dias disponíveis no planner
  const allDays = data.planner || [];
  const today = new Date().toISOString().split('T')[0];
  const availableDays = allDays
    .filter(day => day.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calcular dias selecionados baseado no período
  const getSelectedDays = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const generateList = () => {
    const ingredients = {};
    const selectedDays = getSelectedDays();
    
    selectedDays.forEach(date => {
      const dayPlanner = data.planner.find(d => d.date === date);
      if (!dayPlanner) return;

      Object.values(dayPlanner.meals || {}).forEach(meal => {
        if (meal.recipeId) {
          // Se é uma receita, pegar ingredientes da receita
          const recipe = data.recipes.find(r => r.id === meal.recipeId);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
              // Formato novo: objeto { id, quantity, unit }
              if (typeof ingredient === 'object' && ingredient.id) {
                const itemId = ingredient.id;
                const quantity = ingredient.quantity || 1;
                
                // Verificar se precisa conversão (carnes)
                const conversion = MEAT_CONVERSION[itemId] || 1.0;
                const rawQuantity = quantity * conversion;
                
                ingredients[itemId] = (ingredients[itemId] || 0) + rawQuantity;
              } else {
                // Formato antigo: string
                const key = (typeof ingredient === 'string' ? ingredient : ingredient.id || '').toLowerCase().replace(/\s+/g, '-');
                ingredients[key] = (ingredients[key] || 0) + 1;
              }
            });
          }
        } else if (meal.items && meal.items.length > 0) {
          // Se são itens individuais
          meal.items.forEach(item => {
            const itemId = typeof item === 'string' ? item : item.id;
            const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
            
            // Verificar se precisa conversão (carnes)
            const conversion = MEAT_CONVERSION[itemId] || 1.0;
            const rawQuantity = quantity * conversion;
            
            ingredients[itemId] = (ingredients[itemId] || 0) + rawQuantity;
          });
        }
      });
    });

    setShoppingList(ingredients);
  };

  const allIngredients = data.ingredients || {
    carbos: [],
    proteinas: [],
    saladas: [],
    frutas: [],
    adicionais: []
  };

  const getIngredientName = (id) => {
    const allItems = [
      ...(allIngredients.carbos || []),
      ...(allIngredients.proteinas || []),
      ...(allIngredients.saladas || []),
      ...(allIngredients.frutas || []),
      ...(allIngredients.adicionais || [])
    ];
    const item = allItems.find(i => i.id === id);
    return item ? item.name : id;
  };

  const getIngredientUnit = (id) => {
    const allItems = [
      ...(allIngredients.carbos || []),
      ...(allIngredients.proteinas || []),
      ...(allIngredients.saladas || []),
      ...(allIngredients.frutas || []),
      ...(allIngredients.adicionais || [])
    ];
    const item = allItems.find(i => i.id === id);
    return item ? (item.unit || 'g') : 'g';
  };

  const getIngredientGroup = (id) => {
    if (allIngredients.proteinas?.find(i => i.id === id)) return 'proteinas';
    if (allIngredients.carbos?.find(i => i.id === id)) return 'carbos';
    if (allIngredients.saladas?.find(i => i.id === id)) return 'saladas';
    if (allIngredients.frutas?.find(i => i.id === id)) return 'frutas';
    if (allIngredients.adicionais?.find(i => i.id === id)) return 'adicionais';
    return 'outros';
  };

  const groupedList = {};
  Object.entries(shoppingList).forEach(([id, quantity]) => {
    const group = getIngredientGroup(id);
    if (!groupedList[group]) groupedList[group] = [];
    groupedList[group].push({ 
      id, 
      name: getIngredientName(id), 
      quantity,
      unit: getIngredientUnit(id)
    });
  });

  const groupLabels = {
    proteinas: 'Proteínas',
    carbos: 'Carboidratos',
    saladas: 'Saladas',
    frutas: 'Frutas',
    adicionais: 'Adicionais',
    outros: 'Outros'
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;
    
    // Título
    doc.setFontSize(18);
    doc.text('Lista de Compras', margin, yPos);
    yPos += 10;
    
    // Período
    if (startDate && endDate) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const periodText = `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`;
      doc.text(periodText, margin, yPos);
      yPos += 10;
    }
    
    yPos += 5;
    doc.setTextColor(0, 0, 0);
    
    // Grupos
    Object.entries(groupLabels).forEach(([groupKey, groupLabel]) => {
      const items = groupedList[groupKey] || [];
      if (items.length === 0) return;
      
      // Verificar se precisa de nova página
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      
      // Título do grupo
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(groupLabel, margin, yPos);
      yPos += 8;
      
      // Itens do grupo
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      items.forEach(({ name, quantity, unit, id }) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = margin;
        }
        
        const isMeat = MEAT_CONVERSION[id] && MEAT_CONVERSION[id] > 1;
        const quantityText = `${quantity.toFixed(1)}${unit}${isMeat ? ' (cru)' : ''}`;
        const itemText = `• ${name}`;
        
        doc.text(itemText, margin + 5, yPos);
        doc.text(quantityText, pageWidth - margin - 30, yPos, { align: 'right' });
        yPos += 7;
      });
      
      yPos += 5; // Espaço entre grupos
    });
    
    // Salvar PDF
    const fileName = `lista-compras-${startDate || 'inicio'}-${endDate || 'fim'}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Gerar Lista de Compras</h1>

      {/* Seleção de período */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Selecione o período</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f6d7a] focus:border-[#4f6d7a]"
            />
          </div>
          {startDate && endDate && (
            <div className="text-sm text-gray-600">
              Período: {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
              <br />
              <span className="font-medium">{getSelectedDays().length} dia(s) selecionado(s)</span>
            </div>
          )}
        </div>
        <button
          onClick={generateList}
          disabled={!startDate || !endDate || getSelectedDays().length === 0}
          className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{ backgroundColor: startDate && endDate ? '#4f6d7a' : '#eaeaea' }}
          onMouseEnter={(e) => {
            if (startDate && endDate) e.target.style.backgroundColor = '#dd6e42';
          }}
          onMouseLeave={(e) => {
            if (startDate && endDate) e.target.style.backgroundColor = '#4f6d7a';
          }}
        >
          Gerar Lista
        </button>
      </div>

      {/* Lista gerada */}
      {Object.keys(shoppingList).length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
            >
              📄 Exportar PDF
            </button>
          </div>
          {Object.entries(groupLabels).map(([groupKey, groupLabel]) => {
            const items = groupedList[groupKey] || [];
            if (items.length === 0) return null;

            return (
              <div key={groupKey} className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-3">{groupLabel}</h2>
                <div className="space-y-2">
                  {items.map(({ id, name, quantity, unit }) => {
                    const isMeat = MEAT_CONVERSION[id] && MEAT_CONVERSION[id] > 1;
                    return (
                      <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{name}</span>
                        <div className="text-right">
                          <span className="font-bold">{quantity.toFixed(1)}{unit}</span>
                          {isMeat && (
                            <span className="text-xs text-gray-500 ml-1">(cru)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(!startDate || !endDate) && Object.keys(shoppingList).length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Selecione o período inicial e final, depois clique em "Gerar Lista" para ver os ingredientes necessários
        </div>
      )}
    </div>
  );
}

