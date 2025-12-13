import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getWeekStart } from '../utils/storage';
import { getWorkoutTime, isWorkDay } from '../utils/calculations';

const DEFAULT_INGREDIENTS = {
  carbos: [
    { id: 'arroz', name: 'Arroz', icon: '🍚' },
    { id: 'feijao', name: 'Feijão', icon: '🫘' },
    { id: 'cuscuz', name: 'Cuscuz', icon: '🌾' },
    { id: 'pao-integral', name: 'Pão Integral', icon: '🍞' }
  ],
  proteinas: [
    { id: 'frango-cubos', name: 'Frango em Cubos', icon: '🍗' },
    { id: 'frango-desfiado', name: 'Frango Desfiado', icon: '🍗' },
    { id: 'frango-empanado', name: 'Frango Empanado', icon: '🍗' },
    { id: 'sobrecoxa', name: 'Sobrecoxa', icon: '🍗' },
    { id: 'carne-moida', name: 'Carne Moída', icon: '🥩' },
    { id: 'ovos', name: 'Ovos', icon: '🥚' }
  ],
  saladas: [
    { id: 'alface', name: 'Alface', icon: '🥬' },
    { id: 'tomate', name: 'Tomate', icon: '🍅' },
    { id: 'cebola', name: 'Cebola', icon: '🧅' },
    { id: 'cenoura', name: 'Cenoura', icon: '🥕' },
    { id: 'beterraba', name: 'Beterraba', icon: '🍠' },
    { id: 'repolho', name: 'Repolho', icon: '🥬' }
  ],
  frutas: [
    { id: 'maca', name: 'Maçã', icon: '🍎' },
    { id: 'uva', name: 'Uva', icon: '🍇' },
    { id: 'morango', name: 'Morango', icon: '🍓' },
    { id: 'manga', name: 'Manga', icon: '🥭' },
    { id: 'mamao', name: 'Mamão', icon: '🍈' }
  ],
  outros: [
    { id: 'whey', name: 'Whey Protein', icon: '🥤' },
    { id: 'castanhas', name: 'Castanhas', icon: '🥜' },
    { id: 'nozes', name: 'Nozes', icon: '🌰' }
  ]
};

export default function Planner() {
  const { data, updatePlanner, updateData } = useStorage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealMode, setMealMode] = useState({}); // { mealType: 'recipe' | 'individual' }

  if (!data) return <div className="p-4">Carregando...</div>;

  // Usar ingredientes do storage ou padrão
  const individualItems = data.ingredients || DEFAULT_INGREDIENTS;

  const weekStart = getWeekStart(new Date());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    week.push(date.toISOString().split('T')[0]);
  }

  const selectedDay = data.planner.find(d => d.date === selectedDate);
  const dayOfWeek = new Date(selectedDate).getDay();
  const isWork = isWorkDay(selectedDate);
  const dayActivities = selectedDay?.activities || [];
  
  // Obter atividades disponíveis
  const activities = data.activities || {
    vôlei: { name: 'Vôlei', icon: '🏐', time: '20:00', daysOfWeek: [1, 3] },
    academia: { name: 'Academia', icon: '💪', time: null, daysOfWeek: [2, 4, 5, 6] }
  };

  const handleActivityToggle = (activityId) => {
    const updated = { ...data };
    const dayIndex = updated.planner.findIndex(d => d.date === selectedDate);
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
    updatePlanner(selectedDate, mealType, mealData);
    setMealMode({ ...mealMode, [mealType]: 'recipe' });
  };

  // Salvar refeição com itens individuais
  const handleItemsSelect = (mealType, selectedItems) => {
    const mealData = {
      time: mealTimes[mealType],
      recipeId: null,
      recipeName: null,
      items: selectedItems
    };
    updatePlanner(selectedDate, mealType, mealData);
    setMealMode({ ...mealMode, [mealType]: 'individual' });
  };

  // Toggle item individual
  const toggleIndividualItem = (mealType, itemId) => {
    const meal = selectedDay?.meals[mealType] || { items: [] };
    const currentItems = meal.items || [];
    const newItems = currentItems.includes(itemId)
      ? currentItems.filter(id => id !== itemId)
      : [...currentItems, itemId];
    handleItemsSelect(mealType, newItems);
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
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Receita
          </button>
          <button
            onClick={() => setMealMode({ ...mealMode, [mealType]: 'individual' })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentMode === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
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
              <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                ✓ {meal.recipeName}
              </p>
            )}
          </div>
        )}

        {/* Seleção de itens individuais */}
        {currentMode === 'individual' && (
          <div className="space-y-3">
            {/* Carboidratos */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Carboidratos</h4>
              <div className="flex flex-wrap gap-2">
                {individualItems.carbos.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleIndividualItem(mealType, item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      meal.items?.includes(item.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Proteínas */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Proteínas</h4>
              <div className="flex flex-wrap gap-2">
                {individualItems.proteinas.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleIndividualItem(mealType, item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      meal.items?.includes(item.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Saladas */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Saladas</h4>
              <div className="flex flex-wrap gap-2">
                {individualItems.saladas.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleIndividualItem(mealType, item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      meal.items?.includes(item.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frutas (especialmente para lanches) */}
            {(mealType === 'lancheManha' || mealType === 'lancheTarde') && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Frutas</h4>
                <div className="flex flex-wrap gap-2">
                  {individualItems.frutas.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleIndividualItem(mealType, item.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        meal.items?.includes(item.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.icon} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outros (para pós-treino principalmente) */}
            {mealType === 'posTreino' && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Outros</h4>
                <div className="flex flex-wrap gap-2">
                  {individualItems.outros.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleIndividualItem(mealType, item.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        meal.items?.includes(item.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.icon} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar itens selecionados */}
            {meal.items && meal.items.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-xs font-semibold text-gray-600 mb-1">Selecionados:</p>
                <p className="text-sm text-gray-700">
                  {meal.items.map((itemId, idx) => {
                    const item = [...individualItems.carbos, ...individualItems.proteinas, 
                                  ...individualItems.saladas, ...individualItems.frutas, 
                                  ...individualItems.outros].find(i => i.id === itemId);
                    return item ? `${item.icon} ${item.name}${idx < meal.items.length - 1 ? ', ' : ''}` : '';
                  }).join('')}
                </p>
              </div>
            )}
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
                    ? 'bg-green-600 text-white'
                    : isToday
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
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
