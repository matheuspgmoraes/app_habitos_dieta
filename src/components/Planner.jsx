import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getWeekStart } from '../utils/storage';
import { getWorkoutTime, isWorkDay } from '../utils/calculations';

const DEFAULT_INGREDIENTS = {
  carbos: [
    { id: 'arroz', name: 'Arroz', icon: '🍚', unit: 'g' },
    { id: 'feijao', name: 'Feijão', icon: '🫘', unit: 'g' },
    { id: 'cuscuz', name: 'Cuscuz', icon: '🌾', unit: 'g' },
    { id: 'pao-integral', name: 'Pão Integral', icon: '🍞', unit: 'g' }
  ],
  proteinas: [
    { id: 'frango-cubos', name: 'Frango em Cubos', icon: '🍗', unit: 'g' },
    { id: 'frango-desfiado', name: 'Frango Desfiado', icon: '🍗', unit: 'g' },
    { id: 'frango-empanado', name: 'Frango Empanado', icon: '🍗', unit: 'g' },
    { id: 'sobrecoxa', name: 'Sobrecoxa', icon: '🍗', unit: 'g' },
    { id: 'carne-moida', name: 'Carne Moída', icon: '🥩', unit: 'g' },
    { id: 'ovos', name: 'Ovos', icon: '🥚', unit: 'un' }
  ],
  saladas: [
    { id: 'alface', name: 'Alface', icon: '🥬', unit: 'porção' },
    { id: 'tomate', name: 'Tomate', icon: '🍅', unit: 'porção' },
    { id: 'cebola', name: 'Cebola', icon: '🧅', unit: 'porção' },
    { id: 'cenoura', name: 'Cenoura', icon: '🥕', unit: 'porção' },
    { id: 'beterraba', name: 'Beterraba', icon: '🍠', unit: 'porção' },
    { id: 'repolho', name: 'Repolho', icon: '🥬', unit: 'porção' }
  ],
  frutas: [
    { id: 'maca', name: 'Maçã', icon: '🍎', unit: 'un' },
    { id: 'uva', name: 'Uva', icon: '🍇', unit: 'un' },
    { id: 'morango', name: 'Morango', icon: '🍓', unit: 'un' },
    { id: 'manga', name: 'Manga', icon: '🥭', unit: 'un' },
    { id: 'mamao', name: 'Mamão', icon: '🍈', unit: 'un' }
  ],
  outros: [
    { id: 'whey', name: 'Whey Protein', icon: '🥤', unit: 'g' },
    { id: 'castanhas', name: 'Castanhas', icon: '🥜', unit: 'g' },
    { id: 'nozes', name: 'Nozes', icon: '🌰', unit: 'g' }
  ]
};

export default function Planner() {
  const { data, updatePlanner, updateData } = useStorage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealMode, setMealMode] = useState({}); // { mealType: 'recipe' | 'individual' }
  const processedDatesRef = useRef(new Set()); // Rastrear datas já processadas

  // Pré-marcar atividades baseadas em daysOfWeek (apenas uma vez quando o dia é selecionado)
  // IMPORTANTE: Este useEffect deve estar ANTES de qualquer return condicional
  useEffect(() => {
    if (!data || !selectedDate || !data.planner) return;
    
    // Verificar se já processou esta data
    if (processedDatesRef.current.has(selectedDate)) return;
    
    const currentActivities = data.activities || {
      vôlei: { name: 'Vôlei', icon: '🏐', time: '20:00', daysOfWeek: [1, 3] },
      academia: { name: 'Academia', icon: '💪', time: null, daysOfWeek: [2, 4, 5, 6] }
    };
    
    let dayIndex = data.planner.findIndex(d => d.date === selectedDate);
    
    // Se o dia não existe, criar primeiro
    if (dayIndex === -1) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      const newDay = {
        date: selectedDate,
        meals: {
          cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
          lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
          almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
          lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
          jantar: { time: dayOfWeek === 1 || dayOfWeek === 3 ? '18:00' : '18:30', recipeId: null, recipeName: null, items: [] },
          posTreino: { time: (dayOfWeek === 1 || dayOfWeek === 3) ? '22:00' : null, recipeId: null, recipeName: null, items: [] }
        },
        activities: []
      };
      const updated = { ...data };
      updated.planner.push(newDay);
      updated.planner.sort((a, b) => new Date(a.date) - new Date(b.date));
      updateData(updated);
      processedDatesRef.current.add(selectedDate);
      return; // Retornar aqui para evitar processar novamente neste ciclo
    }

    const dayActivities = data.planner[dayIndex]?.activities || [];
    const currentDayOfWeek = new Date(selectedDate).getDay();
    let needsUpdate = false;
    const newActivities = [...dayActivities];
    const updated = JSON.parse(JSON.stringify(data)); // Deep copy para evitar mutação

    Object.entries(currentActivities).forEach(([id, activity]) => {
      const daysOfWeek = activity.daysOfWeek || [];
      if (daysOfWeek.includes(currentDayOfWeek) && !dayActivities.includes(id)) {
        newActivities.push(id);
        needsUpdate = true;
        
        // Criar hábito automaticamente se não existir
        const habitId = `activity-${id}`;
        const existingHabit = updated.dailyHabits?.find(h => h.id === habitId);
        if (!existingHabit) {
          if (!updated.dailyHabits) updated.dailyHabits = [];
          updated.dailyHabits.push({
            id: habitId,
            name: activity.name,
            icon: activity.icon,
            type: 'boolean',
            target: 1,
            frequency: 'daily'
          });
        }
      }
    });

    if (needsUpdate) {
      updated.planner[dayIndex].activities = newActivities;
      updateData(updated);
    }
    
    processedDatesRef.current.add(selectedDate); // Marcar como processado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  if (!data) return <div className="p-4">Carregando...</div>;

  // Garantir que planner existe e é um array
  if (!data.planner) {
    // Inicializar planner se não existir
    try {
      const updated = { ...data, planner: [] };
      updateData(updated);
    } catch (error) {
      console.error('Erro ao inicializar planner:', error);
    }
  }
  
  if (!Array.isArray(data.planner)) {
    // Tentar corrigir se não for array
    try {
      const updated = { ...data, planner: [] };
      updateData(updated);
    } catch (error) {
      console.error('Erro ao corrigir planner:', error);
    }
    return <div className="p-4">Erro: Planner não inicializado. Recarregue a página.</div>;
  }

  // Usar ingredientes do storage ou padrão
  const individualItems = data.ingredients || DEFAULT_INGREDIENTS;

  // Últimos 7 dias + próximos 7 dias (14 dias total)
  const today = new Date();
  const week = [];
  // Últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    week.push(date.toISOString().split('T')[0]);
  }
  // Próximos 7 dias
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    week.push(date.toISOString().split('T')[0]);
  }

  // Obter atividades disponíveis
  const activities = data.activities || {
    vôlei: { name: 'Vôlei', icon: '🏐', time: '20:00', daysOfWeek: [1, 3] },
    academia: { name: 'Academia', icon: '💪', time: null, daysOfWeek: [2, 4, 5, 6] }
  };

  // Obter ou criar dia do planner
  const getOrCreateDay = (dateStr) => {
    try {
      if (!data.planner || !Array.isArray(data.planner)) {
        return {
          date: dateStr,
          meals: {
            cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
            lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
            almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
            lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
            jantar: { time: '18:30', recipeId: null, recipeName: null, items: [] },
            posTreino: { time: null, recipeId: null, recipeName: null, items: [] }
          },
          activities: []
        };
      }
      const dayIndex = data.planner.findIndex(d => d && d.date === dateStr);
      if (dayIndex === -1) {
        // Criar dia se não existir (mas não atualizar ainda para evitar re-render)
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        return {
          date: dateStr,
          meals: {
            cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
            lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
            almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
            lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
            jantar: { time: dayOfWeek === 1 || dayOfWeek === 3 ? '18:00' : '18:30', recipeId: null, recipeName: null, items: [] },
            posTreino: { time: (dayOfWeek === 1 || dayOfWeek === 3) ? '22:00' : null, recipeId: null, recipeName: null, items: [] }
          },
          activities: []
        };
      }
      return data.planner[dayIndex] || {
        date: dateStr,
        meals: {
          cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
          lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
          almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
          lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
          jantar: { time: '18:30', recipeId: null, recipeName: null, items: [] },
          posTreino: { time: null, recipeId: null, recipeName: null, items: [] }
        },
        activities: []
      };
    } catch (error) {
      console.error('Erro ao obter/criar dia:', error);
      return {
        date: dateStr,
        meals: {
          cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
          lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
          almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
          lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
          jantar: { time: '18:30', recipeId: null, recipeName: null, items: [] },
          posTreino: { time: null, recipeId: null, recipeName: null, items: [] }
        },
        activities: []
      };
    }
  };

  // Obter dia selecionado com tratamento de erro
  let selectedDay;
  try {
    selectedDay = getOrCreateDay(selectedDate);
  } catch (error) {
    console.error('Erro ao obter dia selecionado:', error);
    selectedDay = {
      date: selectedDate,
      meals: {
        cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
        lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
        almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
        lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
        jantar: { time: '18:30', recipeId: null, recipeName: null, items: [] },
        posTreino: { time: null, recipeId: null, recipeName: null, items: [] }
      },
      activities: []
    };
  }
  
  const dayOfWeek = new Date(selectedDate).getDay();
  const isWork = isWorkDay(selectedDate);
  const dayActivities = selectedDay?.activities || [];

  const handleActivityToggle = (activityId) => {
    const updated = { ...data };
    let dayIndex = updated.planner.findIndex(d => d.date === selectedDate);
    
    // Criar dia se não existir
    if (dayIndex === -1) {
      const newDay = getOrCreateDay(selectedDate);
      updated.planner.push(newDay);
      updated.planner.sort((a, b) => new Date(a.date) - new Date(b.date));
      dayIndex = updated.planner.findIndex(d => d.date === selectedDate);
    }
    
    if (dayIndex === -1) return;

    const currentActivities = updated.planner[dayIndex].activities || [];
    const isSelected = currentActivities.includes(activityId);
    
    if (isSelected) {
      // Remover atividade
      updated.planner[dayIndex].activities = currentActivities.filter(id => id !== activityId);
      
      // Limpar progresso do hábito deste dia
      const habitId = `activity-${activityId}`;
      const checklistDayIndex = updated.checklist.findIndex(d => d.date === selectedDate);
      if (checklistDayIndex !== -1) {
        if (updated.checklist[checklistDayIndex].habits && updated.checklist[checklistDayIndex].habits[habitId]) {
          delete updated.checklist[checklistDayIndex].habits[habitId];
        }
      }
    } else {
      // Adicionar atividade
      updated.planner[dayIndex].activities = [...currentActivities, activityId];
      
      // Criar hábito automaticamente se não existir
      const activity = activities[activityId];
      if (activity) {
        const habitId = `activity-${activityId}`;
        const existingHabit = updated.dailyHabits?.find(h => h.id === habitId);
        
        if (!existingHabit) {
          if (!updated.dailyHabits) updated.dailyHabits = [];
          updated.dailyHabits.push({
            id: habitId,
            name: activity.name,
            icon: activity.icon,
            type: 'boolean',
            target: 1,
            frequency: 'daily'
          });
        }
        
        // Adicionar ao checklist do dia
        const checklistDayIndex = updated.checklist.findIndex(d => d.date === selectedDate);
        if (checklistDayIndex !== -1) {
          if (!updated.checklist[checklistDayIndex].habits) {
            updated.checklist[checklistDayIndex].habits = {};
          }
          // Não marca como feito automaticamente, só adiciona o hábito
        }
      }
    }
    
    updateData(updated);
  };

  const mealTimes = {
    cafe: '07:00',
    lancheManha: '09:00',
    almoco: '12:30',
    lancheTarde: '15:30',
    jantar: dayOfWeek === 1 || dayOfWeek === 3 ? '18:00' : '18:30',
    posTreino: (dayOfWeek === 1 || dayOfWeek === 3) ? '22:00' : null
  };

  const mealLabels = {
    cafe: 'Café da manhã',
    lancheManha: 'Lanche da manhã',
    almoco: 'Almoço',
    lancheTarde: 'Lanche da tarde',
    jantar: 'Jantar',
    posTreino: 'Pós-treino'
  };

  // Obter modo atual da refeição (receita ou itens individuais)
  const getMealMode = (mealType) => {
    if (mealMode[mealType]) return mealMode[mealType];
    // Se já tem uma receita salva, assume que é receita
    const meal = selectedDay?.meals[mealType];
    if (meal?.recipeId) return 'recipe';
    if (meal?.items && meal.items.length > 0) return 'individual';
    return null; // Nenhum modo selecionado ainda
  };

  // Salvar refeição como receita
  const handleRecipeSelect = (mealType, recipeId) => {
    const recipe = data.recipes.find(r => r.id === recipeId);
    const mealData = {
      time: mealTimes[mealType],
      recipeId: recipeId,
      recipeName: recipe?.name || '',
      items: null
    };
    // updatePlanner já cria o dia se não existir
    updatePlanner(selectedDate, mealType, mealData);
    setMealMode({ ...mealMode, [mealType]: 'recipe' });
  };

  // Salvar refeição com itens individuais
  const handleItemsSelect = (mealType, selectedItems) => {
    const mealData = {
      time: mealTimes[mealType],
      recipeId: null,
      recipeName: null,
      items: selectedItems // Array de objetos { id, quantity }
    };
    // updatePlanner já cria o dia se não existir
    updatePlanner(selectedDate, mealType, mealData);
    setMealMode({ ...mealMode, [mealType]: 'individual' });
  };

  // Toggle item individual ou atualizar quantidade
  const toggleIndividualItem = (mealType, itemId, quantity = 1) => {
    try {
      const meal = selectedDay?.meals?.[mealType] || { items: [] };
      const currentItems = meal.items || [];
      
      // Converter formato antigo (array de strings) para novo (array de objetos)
      const normalizedItems = currentItems.map(item => {
        if (typeof item === 'string') {
          return { id: item, quantity: 1 };
        }
        // Garantir que tem id e quantity válidos
        if (!item || !item.id) {
          return null;
        }
        return {
          id: item.id,
          quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1
        };
      }).filter(item => item !== null);
      
      const existingIndex = normalizedItems.findIndex(item => item.id === itemId);
      let newItems;
      
      if (existingIndex >= 0) {
        // Se já existe, remover ou atualizar quantidade
        if (quantity <= 0 || isNaN(quantity)) {
          newItems = normalizedItems.filter(item => item.id !== itemId);
        } else {
          newItems = [...normalizedItems];
          // Garantir que quantity é um número válido
          newItems[existingIndex] = { id: itemId, quantity: parseFloat(quantity) || 1 };
        }
      } else {
        // Adicionar novo item - garantir que quantity é um número válido
        const validQuantity = parseFloat(quantity);
        if (isNaN(validQuantity) || validQuantity <= 0) {
          return; // Não adicionar se quantidade inválida
        }
        newItems = [...normalizedItems, { id: itemId, quantity: validQuantity }];
      }
      
      handleItemsSelect(mealType, newItems);
    } catch (error) {
      console.error('Erro ao toggle item:', error);
      // Não fazer nada em caso de erro para evitar quebrar a página
    }
  };

  // Renderizar seleção de refeição
  const renderMealSelection = (mealType, time) => {
    const currentMode = getMealMode(mealType);
    const meal = selectedDay?.meals[mealType] || { time, items: [] };

    return (
      <div key={mealType} className="border-b pb-4 last:border-0 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {mealLabels[mealType]} - {time}
          </label>
        </div>

        {/* Botões para escolher modo */}
        <div className="flex gap-2">
          <button
            onClick={() => setMealMode({ ...mealMode, [mealType]: 'recipe' })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentMode === 'recipe'
                ? 'text-white'
                : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
            }`}
            style={currentMode === 'recipe' ? { backgroundColor: '#4f6d7a' } : {}}
          >
            📋 Receita
          </button>
          <button
            onClick={() => setMealMode({ ...mealMode, [mealType]: 'individual' })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentMode === 'individual'
                ? 'text-white'
                : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
            }`}
            style={currentMode === 'individual' ? { backgroundColor: '#4f6d7a' } : {}}
          >
            🍽️ Itens
          </button>
        </div>

        {/* Seleção de receita */}
        {currentMode === 'recipe' && (
          <div className="space-y-2">
            <select
              value={meal.recipeId || ''}
              onChange={(e) => handleRecipeSelect(mealType, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Selecione uma receita</option>
              {data.recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>
            {meal.recipeName && (
              <p className="text-sm text-gray-600 p-2 rounded" style={{ backgroundColor: '#c0d6df' }}>
                ✓ {meal.recipeName}
              </p>
            )}
          </div>
        )}

            {/* Seleção de itens individuais */}
        {currentMode === 'individual' && (
          <div className="space-y-3">
            {/* Converter items para formato normalizado */}
            {(() => {
              const normalizedItems = (meal.items || []).map(item => 
                typeof item === 'string' ? { id: item, quantity: 1 } : item
              );
              const selectedItemsMap = new Map(normalizedItems.map(item => [item.id, item.quantity]));
              
              return (
                <>
                  {/* Carboidratos */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Carboidratos</h4>
                    <div className="flex flex-wrap gap-2">
                      {individualItems.carbos.map(item => {
                        const isSelected = selectedItemsMap.has(item.id);
                        const savedQuantity = isSelected ? selectedItemsMap.get(item.id) : null;
                        // Se está selecionado, usar quantidade salva; se não está selecionado, não mostrar quantidade
                        const displayQuantity = savedQuantity !== null && savedQuantity !== undefined 
                          ? savedQuantity 
                          : (isSelected && item.hasBaseQuantity ? parseFloat(item.baseQuantity) : 1);
                        return (
                          <div key={item.id} className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (!isSelected) {
                                  // Se tem valor base, usar ele, senão usar 1
                                  const baseQty = item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1;
                                  toggleIndividualItem(mealType, item.id, baseQty);
                                } else {
                                  toggleIndividualItem(mealType, item.id, 0);
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                isSelected
                                  ? 'text-white'
                                  : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
                              }`}
                              style={isSelected ? { backgroundColor: '#4f6d7a' } : {}}
                            >
                              {item.icon} {item.name}
                              {item.hasBaseQuantity && !isSelected && (
                                <span className="text-xs ml-1 opacity-75">({item.baseQuantity || 0}{item.unit || 'g'})</span>
                              )}
                            </button>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={displayQuantity || 1}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '' || inputValue === '0') {
                                      toggleIndividualItem(mealType, item.id, 0);
                                    } else {
                                      const newQty = parseFloat(inputValue);
                                      if (!isNaN(newQty) && newQty > 0) {
                                        toggleIndividualItem(mealType, item.id, newQty);
                                      }
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Proteínas */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Proteínas</h4>
                    <div className="flex flex-wrap gap-2">
                      {individualItems.proteinas.map(item => {
                        const isSelected = selectedItemsMap.has(item.id);
                        const savedQuantity = isSelected ? selectedItemsMap.get(item.id) : null;
                        const displayQuantity = savedQuantity !== null && savedQuantity !== undefined 
                          ? savedQuantity 
                          : (isSelected && item.hasBaseQuantity ? parseFloat(item.baseQuantity) : null);
                        return (
                          <div key={item.id} className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (!isSelected) {
                                  const baseQty = item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1;
                                  toggleIndividualItem(mealType, item.id, baseQty);
                                } else {
                                  toggleIndividualItem(mealType, item.id, 0);
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                isSelected
                                  ? 'text-white'
                                  : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
                              }`}
                              style={isSelected ? { backgroundColor: '#4f6d7a' } : {}}
                            >
                              {item.icon} {item.name}
                              {item.hasBaseQuantity && !isSelected && (
                                <span className="text-xs ml-1 opacity-75">({item.baseQuantity || 0}{item.unit || 'g'})</span>
                              )}
                            </button>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={savedQuantity !== null && savedQuantity !== undefined ? savedQuantity : (item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1)}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '' || inputValue === '0') {
                                      toggleIndividualItem(mealType, item.id, 0);
                                    } else {
                                      const newQty = parseFloat(inputValue);
                                      if (!isNaN(newQty) && newQty > 0) {
                                        toggleIndividualItem(mealType, item.id, newQty);
                                      }
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Saladas */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Saladas</h4>
                    <div className="flex flex-wrap gap-2">
                      {individualItems.saladas.map(item => {
                        const isSelected = selectedItemsMap.has(item.id);
                        const savedQuantity = isSelected ? selectedItemsMap.get(item.id) : null;
                        const displayQuantity = savedQuantity !== null && savedQuantity !== undefined 
                          ? savedQuantity 
                          : (isSelected && item.hasBaseQuantity ? parseFloat(item.baseQuantity) : null);
                        return (
                          <div key={item.id} className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (!isSelected) {
                                  const baseQty = item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1;
                                  toggleIndividualItem(mealType, item.id, baseQty);
                                } else {
                                  toggleIndividualItem(mealType, item.id, 0);
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                isSelected
                                  ? 'text-white'
                                  : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
                              }`}
                              style={isSelected ? { backgroundColor: '#4f6d7a' } : {}}
                            >
                              {item.icon} {item.name}
                              {item.hasBaseQuantity && !isSelected && (
                                <span className="text-xs ml-1 opacity-75">({item.baseQuantity || 0}{item.unit || 'g'})</span>
                              )}
                            </button>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={savedQuantity !== null && savedQuantity !== undefined ? savedQuantity : (item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1)}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '' || inputValue === '0') {
                                      toggleIndividualItem(mealType, item.id, 0);
                                    } else {
                                      const newQty = parseFloat(inputValue);
                                      if (!isNaN(newQty) && newQty > 0) {
                                        toggleIndividualItem(mealType, item.id, newQty);
                                      }
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Frutas (especialmente para lanches) */}
                  {(mealType === 'lancheManha' || mealType === 'lancheTarde') && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Frutas</h4>
                      <div className="flex flex-wrap gap-2">
                        {individualItems.frutas.map(item => {
                          const isSelected = selectedItemsMap.has(item.id);
                          const savedQuantity = isSelected ? selectedItemsMap.get(item.id) : null;
                          const displayQuantity = savedQuantity !== null && savedQuantity !== undefined 
                            ? savedQuantity 
                            : (isSelected && item.hasBaseQuantity ? parseFloat(item.baseQuantity) : null);
                          return (
                            <div key={item.id} className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (!isSelected) {
                                    const baseQty = item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1;
                                    toggleIndividualItem(mealType, item.id, baseQty);
                                  } else {
                                    toggleIndividualItem(mealType, item.id, 0);
                                  }
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                  isSelected
                                    ? 'text-white'
                                    : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
                                }`}
                                style={isSelected ? { backgroundColor: '#4f6d7a' } : {}}
                              >
                                {item.icon} {item.name}
                                {item.hasBaseQuantity && !isSelected && (
                                  <span className="text-xs ml-1 opacity-75">({item.baseQuantity || 0}{item.unit || 'g'})</span>
                                )}
                              </button>
                              {isSelected && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={displayQuantity !== null && displayQuantity !== undefined ? displayQuantity : (item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1)}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (inputValue === '' || inputValue === '0') {
                                        toggleIndividualItem(mealType, item.id, 0);
                                      } else {
                                        const newQty = parseFloat(inputValue);
                                        if (!isNaN(newQty) && newQty > 0) {
                                          toggleIndividualItem(mealType, item.id, newQty);
                                        }
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                                  />
                                  <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Outros (para pós-treino principalmente) */}
                  {mealType === 'posTreino' && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Outros</h4>
                      <div className="flex flex-wrap gap-2">
                        {individualItems.outros.map(item => {
                          const isSelected = selectedItemsMap.has(item.id);
                          const savedQuantity = isSelected ? selectedItemsMap.get(item.id) : null;
                          const displayQuantity = savedQuantity !== null && savedQuantity !== undefined 
                            ? savedQuantity 
                            : (isSelected && item.hasBaseQuantity ? parseFloat(item.baseQuantity) : null);
                          return (
                            <div key={item.id} className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (!isSelected) {
                                    const baseQty = item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1;
                                    toggleIndividualItem(mealType, item.id, baseQty);
                                  } else {
                                    toggleIndividualItem(mealType, item.id, 0);
                                  }
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                  isSelected
                                    ? 'text-white'
                                    : 'bg-[#eaeaea] text-gray-700 hover:bg-[#c0d6df]'
                                }`}
                                style={isSelected ? { backgroundColor: '#4f6d7a' } : {}}
                              >
                                {item.icon} {item.name}
                                {item.hasBaseQuantity && !isSelected && (
                                  <span className="text-xs ml-1 opacity-75">({item.baseQuantity || 0}{item.unit || 'g'})</span>
                                )}
                              </button>
                              {isSelected && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={displayQuantity !== null && displayQuantity !== undefined ? displayQuantity : (item.hasBaseQuantity ? parseFloat(item.baseQuantity) || 1 : 1)}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (inputValue === '' || inputValue === '0') {
                                        toggleIndividualItem(mealType, item.id, 0);
                                      } else {
                                        const newQty = parseFloat(inputValue);
                                        if (!isNaN(newQty) && newQty > 0) {
                                          toggleIndividualItem(mealType, item.id, newQty);
                                        }
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                                  />
                                  <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mostrar itens selecionados */}
                  {normalizedItems.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Selecionados:</p>
                      <p className="text-sm text-gray-700">
                        {normalizedItems.map((item, idx) => {
                          const allItems = [...individualItems.carbos, ...individualItems.proteinas, 
                                            ...individualItems.saladas, ...individualItems.frutas, 
                                            ...individualItems.outros];
                          const itemData = allItems.find(i => i.id === item.id);
                          const unit = itemData?.unit || 'g';
                          return itemData 
                            ? `${itemData.icon} ${itemData.name} (${item.quantity}${unit})${idx < normalizedItems.length - 1 ? ', ' : ''}` 
                            : '';
                        }).join('')}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Planner Diário</h1>

      {/* Seletor de semana */}
      <div className="bg-white rounded-lg shadow p-2">
        <div className="flex gap-2 overflow-x-auto">
          {week.map((date, idx) => {
            const d = new Date(date);
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const isSelected = date === selectedDate;
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
                  isSelected
                    ? 'bg-[#4f6d7a] text-white'
                    : isToday
                    ? 'bg-[#c0d6df] text-[#4f6d7a]'
                    : 'bg-[#eaeaea] text-gray-700'
                }`}
              >
                <div>{dayNames[d.getDay()]}</div>
                <div className="text-xs">{d.getDate()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Informações do dia */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          {isWork && (
            <p className="text-sm text-orange-600 mt-1">⚠️ Dia de trabalho - lanches devem ser frutas fáceis</p>
          )}
          
          {/* Seletor de Atividades */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Atividades do Dia</label>
            {Object.keys(activities).length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nenhuma atividade cadastrada. Vá em <strong>Atividades</strong> para criar atividades.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(activities).map(([id, activity]) => {
                  const isSelected = dayActivities.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleActivityToggle(id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{activity.icon}</span>
                        <span className="font-medium">{activity.name}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                    </button>
                  );
                })}
                {dayActivities.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    As atividades selecionadas aparecerão automaticamente no Checklist de Hábitos
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          {Object.entries(mealTimes).map(([mealType, time]) => {
            if (mealType === 'posTreino' && !time) return null;
            return renderMealSelection(mealType, time);
          })}
        </div>
      </div>
    </div>
  );
}
