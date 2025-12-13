import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getWeekStart } from '../utils/storage';
import { calculateDayProgress, calculateWeekProgress } from '../utils/calculations';

export default function Checklist() {
  const { data, updateChecklist, updateData } = useStorage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('alimentacao'); // 'alimentacao' ou 'habitos'
  const [showHabitsEditor, setShowHabitsEditor] = useState(false);
  const [newHabit, setNewHabit] = useState({ 
    name: '', 
    icon: '📝',
    type: 'boolean', // 'boolean', 'quantity', 'timesPerDay', 'timesPerWeek'
    target: 1
  });

  if (!data) return <div className="p-4">Carregando...</div>;

  const weekStart = getWeekStart(new Date());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    week.push(date.toISOString().split('T')[0]);
  }

  const selectedDay = data.checklist.find(d => d.date === selectedDate);
  const dayProgress = selectedDay ? calculateDayProgress(selectedDay.items) : 0;
  const weekProgress = calculateWeekProgress(data.checklist);

  // Hábitos diários (rotina)
  const allDailyHabits = data.dailyHabits || [];
  const habitsProgress = selectedDay?.habits || {};
  
  // Obter atividades selecionadas no Planner para este dia
  const plannerDay = data.planner?.find(d => d.date === selectedDate);
  const dayActivities = plannerDay?.activities || [];
  
  // Filtrar hábitos: mostrar apenas hábitos normais + atividades selecionadas para este dia
  const dailyHabits = allDailyHabits.filter(habit => {
    // Se é um hábito de atividade (começa com "activity-")
    if (habit.id.startsWith('activity-')) {
      const activityId = habit.id.replace('activity-', '');
      return dayActivities.includes(activityId);
    }
    // Hábitos normais sempre aparecem
    return true;
  });

  const checklistItems = [
    { key: 'cafe', label: 'Café da manhã', icon: '☕' },
    { key: 'lancheManha', label: 'Lanche da manhã', icon: '🍎' },
    { key: 'almoco', label: 'Almoço', icon: '🍽️' },
    { key: 'lancheTarde', label: 'Lanche da tarde', icon: '🥗' },
    { key: 'jantar', label: 'Jantar', icon: '🍲' },
    { key: 'posTreino', label: 'Pós-treino', icon: '🥤' },
    { key: 'creatina', label: 'Creatina', icon: '💊' }
  ];

  const handleToggle = (item) => {
    updateChecklist(selectedDate, item, !selectedDay.items[item]);
  };

  const handleWaterChange = (value) => {
    updateChecklist(selectedDate, 'agua', parseFloat(value));
  };

  const handleHabitChange = (habitId, value) => {
    const updated = { ...data };
    const dayIndex = updated.checklist.findIndex(d => d.date === selectedDate);
    if (dayIndex !== -1) {
      if (!updated.checklist[dayIndex].habits) {
        updated.checklist[dayIndex].habits = {};
      }
      updated.checklist[dayIndex].habits[habitId] = value;
      updateData(updated);
    }
  };

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    const updated = { ...data };
    const habit = {
      id: `habit-${Date.now()}`,
      name: newHabit.name.trim(),
      icon: newHabit.icon || '📝',
      type: newHabit.type,
      target: newHabit.target || 1
    };
    updated.dailyHabits.push(habit);
    updateData(updated);
    setNewHabit({ name: '', icon: '📝', type: 'boolean', target: 1 });
  };

  const handleDeleteHabit = (habitId) => {
    if (!confirm('Tem certeza que deseja excluir este hábito?')) return;
    const updated = { ...data };
    updated.dailyHabits = updated.dailyHabits.filter(h => h.id !== habitId);
    updated.checklist.forEach(day => {
      if (day.habits && day.habits[habitId]) {
        delete day.habits[habitId];
      }
    });
    updateData(updated);
  };

  const waterAmount = selectedDay?.items?.agua || 0;

  if (showHistory) {
    return (
      <div className="p-4 space-y-4 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
          <button
            onClick={() => setShowHistory(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium"
          >
            Voltar
          </button>
        </div>

        {data.history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nenhum histórico disponível ainda
          </div>
        ) : (
          <div className="space-y-4">
            {data.history.slice().reverse().map((week, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-2">
                  Semana de {new Date(week.weekStart).toLocaleDateString('pt-BR')}
                </h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso Semanal</span>
                    <span className="font-bold">{week.weeklyPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${week.weeklyPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-3">
                  {week.dailyPercentages.map((pct, dayIdx) => (
                    <div key={dayIdx} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][dayIdx]}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 flex items-center justify-center">
                        <span className="text-xs font-bold">{pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Checklist</h1>
        <button
          onClick={() => setShowHistory(true)}
          className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-medium"
        >
          Histórico
        </button>
      </div>

      {/* Progresso da semana */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso da Semana</span>
          <span className="text-lg font-bold text-blue-600">{weekProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </div>

      {/* Seletor de dia */}
      <div className="bg-white rounded-lg shadow p-2">
        <div className="flex gap-2 overflow-x-auto">
          {week.map((date) => {
            const d = new Date(date);
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const isSelected = date === selectedDate;
            const isToday = date === new Date().toISOString().split('T')[0];
            const dayData = data.checklist.find(c => c.date === date);
            const progress = dayData ? calculateDayProgress(dayData.items) : 0;
            
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
                <div className="text-xs mt-1">{progress}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('alimentacao')}
            className={`flex-1 px-4 py-3 text-center font-medium transition-all ${
              activeTab === 'alimentacao'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🍽️ Alimentação
          </button>
          <button
            onClick={() => setActiveTab('habitos')}
            className={`flex-1 px-4 py-3 text-center font-medium transition-all ${
              activeTab === 'habitos'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ✨ Hábitos
          </button>
        </div>

        <div className="p-4">
          {/* Tab Alimentação */}
          {activeTab === 'alimentacao' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                <span className="text-2xl font-bold text-green-600">{dayProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: dayProgress + '%' }}
                ></div>
              </div>

              <div className="space-y-3">
                {checklistItems.map((item) => {
                  const checked = selectedDay?.items[item.key] || false;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggle(item.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        checked
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        checked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400'
                      }`}>
                        {checked && <span className="text-white text-sm">✓</span>}
                      </div>
                    </button>
                  );
                })}

                {/* Água com slider */}
                <div className="p-3 rounded-lg border-2 border-gray-300 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💧</span>
                      <span className="font-medium">Água</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{waterAmount.toFixed(1)}L</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={waterAmount}
                    onChange={(e) => handleWaterChange(e.target.value)}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(waterAmount / 3) * 100}%, #e5e7eb ${(waterAmount / 3) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0L</span>
                    <span>1.5L</span>
                    <span>3L</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Hábitos */}
          {activeTab === 'habitos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                <button
                  onClick={() => setShowHabitsEditor(!showHabitsEditor)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {showHabitsEditor ? 'Fechar' : '+ Novo'}
                </button>
              </div>

              {/* Editor de Hábitos */}
              {showHabitsEditor && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <h3 className="font-semibold mb-3">Adicionar Hábito</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHabit.icon}
                        onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                        placeholder="Emoji"
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-xl"
                        maxLength="2"
                      />
                      <input
                        type="text"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        placeholder="Nome do hábito"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <select
                      value={newHabit.type}
                      onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value, target: 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="boolean">Sim/Não (checkbox)</option>
                      <option value="quantity">Por quantidade</option>
                      <option value="timesPerDay">Vezes por dia</option>
                      <option value="timesPerWeek">Vezes por semana</option>
                    </select>
                    {(newHabit.type === 'quantity' || newHabit.type === 'timesPerDay' || newHabit.type === 'timesPerWeek') && (
                      <input
                        type="number"
                        value={newHabit.target}
                        onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                        placeholder="Meta"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                    <button
                      onClick={handleAddHabit}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Hábitos */}
              {dailyHabits.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhum hábito cadastrado. Clique em "+ Novo" para adicionar.
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyHabits.map(habit => {
                    const currentValue = habitsProgress[habit.id] || 0;
                    const isComplete = habit.type === 'boolean' 
                      ? currentValue === true
                      : currentValue >= habit.target;

                    return (
                      <div
                        key={habit.id}
                        className={`p-3 rounded-lg border-2 ${
                          isComplete
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{habit.icon}</span>
                            <span className="font-medium">{habit.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>

                        {/* Controles baseados no tipo */}
                        {habit.type === 'boolean' && (
                          <button
                            onClick={() => handleHabitChange(habit.id, !currentValue)}
                            className={`w-full px-3 py-2 rounded-lg font-medium ${
                              currentValue
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {currentValue ? '✓ Feito' : 'Marcar como feito'}
                          </button>
                        )}

                        {habit.type === 'quantity' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Quantidade: {currentValue} / {habit.target}</span>
                              <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                                {isComplete ? '✓' : ''}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHabitChange(habit.id, Math.max(0, currentValue - 1))}
                                className="px-3 py-1 bg-gray-200 rounded"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => handleHabitChange(habit.id, parseInt(e.target.value) || 0)}
                                min="0"
                                max={habit.target * 2}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded text-center"
                              />
                              <button
                                onClick={() => handleHabitChange(habit.id, currentValue + 1)}
                                className="px-3 py-1 bg-gray-200 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        {habit.type === 'timesPerDay' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Vezes hoje: {currentValue} / {habit.target}</span>
                              <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                                {isComplete ? '✓' : ''}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleHabitChange(habit.id, Math.max(0, currentValue - 1))}
                                className="px-3 py-1 bg-gray-200 rounded"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => handleHabitChange(habit.id, parseInt(e.target.value) || 0)}
                                min="0"
                                max={habit.target * 2}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded text-center"
                              />
                              <button
                                onClick={() => handleHabitChange(habit.id, currentValue + 1)}
                                className="px-3 py-1 bg-gray-200 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        {habit.type === 'timesPerWeek' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Vezes na semana: {currentValue} / {habit.target}</span>
                              <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                                {isComplete ? '✓' : ''}
                              </span>
                            </div>
                            <button
                              onClick={() => handleHabitChange(habit.id, currentValue + 1)}
                              className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                            >
                              +1 vez esta semana
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
