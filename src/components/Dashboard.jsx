import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getCurrentDayData, calculateWeekProgress, calculateMonthProgress, calculateYearProgress, getWorkoutForToday, getWorkoutTime } from '../utils/calculations';
import Calendar from './Calendar';

export default function Dashboard() {
  const { data, loading } = useStorage();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [activeTab, setActiveTab] = useState('alimentacao'); // 'alimentacao' ou 'habitos'

  if (loading || !data) {
    return <div className="p-4">Carregando...</div>;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayData = getCurrentDayData(data.checklist, data.planner);
  const weekProgress = calculateWeekProgress(data.checklist);
  const monthProgress = calculateMonthProgress(data.checklist, today.getFullYear(), today.getMonth());
  const yearProgress = calculateYearProgress(data.checklist, today.getFullYear());
  
  // Atividades personalizadas - buscar do planner do dia
  const activities = data.activities || {
    vôlei: { name: 'Vôlei', icon: '🏐', time: '20:00' },
    academia: { name: 'Academia', icon: '💪', time: null }
  };
  const todayActivities = todayData.planner?.activities || [];
  const todayActivitiesData = todayActivities.map(id => activities[id]).filter(Boolean);

  const meals = todayData.planner?.meals || {};
  const dailyHabits = data.dailyHabits || [];
  const todayHabits = todayData.checklist?.habits || {};

  // Calcular progresso de alimentação
  const foodItems = ['cafe', 'lancheManha', 'almoco', 'lancheTarde', 'jantar', 'posTreino', 'creatina', 'agua'];
  const foodCompleted = foodItems.filter(key => {
    if (key === 'agua') {
      return (todayData.checklist?.items?.agua || 0) >= 3;
    }
    return todayData.checklist?.items?.[key] || false;
  }).length;
  const foodProgress = Math.round((foodCompleted / foodItems.length) * 100);

  // Calcular progresso de hábitos
  const habitsProgress = dailyHabits.length > 0 
    ? Math.round((dailyHabits.filter(h => {
        const value = todayHabits[h.id];
        if (h.type === 'boolean') return value === true;
        if (h.type === 'quantity' || h.type === 'timesPerDay' || h.type === 'timesPerWeek') {
          return (value || 0) >= h.target;
        }
        return false;
      }).length / dailyHabits.length) * 100)
    : 0;

  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Progresso do Dia */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progresso do Dia</h2>
          <span className="text-2xl font-bold text-green-600">{todayData.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${todayData.progress}%` }}
          />
        </div>
      </div>

      {/* Progresso da Semana */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progresso da Semana</h2>
          <span className="text-2xl font-bold text-blue-600">{weekProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </div>

      {/* Progresso do Mês */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progresso do Mês</h2>
          <span className="text-2xl font-bold text-purple-600">{monthProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${monthProgress}%` }}
          />
        </div>
      </div>

      {/* Progresso do Ano */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progresso do Ano</h2>
          <span className="text-2xl font-bold text-orange-600">{yearProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-orange-600 h-3 rounded-full transition-all"
            style={{ width: `${yearProgress}%` }}
          />
        </div>
      </div>

      {/* Calendário Mensal */}
      <Calendar 
        checklist={data.checklist || []} 
        onDateSelect={(date) => setSelectedCalendarDate(date)}
      />

      {selectedCalendarDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Data selecionada: {new Date(selectedCalendarDate).toLocaleDateString('pt-BR')}
          <button
            onClick={() => setSelectedCalendarDate(null)}
            className="ml-2 text-blue-600 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Atividades do Dia */}
      {todayActivitiesData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Atividades do Dia</h2>
          <div className="space-y-2">
            {todayActivitiesData.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-2xl">{activity.icon}</span>
                <span className="font-medium">{activity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abas Alimentação e Hábitos */}
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
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">🍽️ Alimentação</h2>
                <span className="text-xl font-bold text-green-600">{foodProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${foodProgress}%` }}
                />
              </div>
              <div className="space-y-2">
                {meals.cafe && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Café da manhã</p>
                      <p className="text-sm text-gray-600">{meals.cafe.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.cafe.recipeName || (meals.cafe.items && meals.cafe.items.length > 0 
                        ? `${meals.cafe.items.length} item(ns)` 
                        : 'Não definido')}
                    </p>
                  </div>
                )}
                {meals.lancheManha && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Lanche da manhã</p>
                      <p className="text-sm text-gray-600">{meals.lancheManha.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.lancheManha.recipeName || (meals.lancheManha.items && meals.lancheManha.items.length > 0 
                        ? `${meals.lancheManha.items.length} item(ns)` 
                        : 'Não definido')}
                    </p>
                  </div>
                )}
                {meals.almoco && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Almoço</p>
                      <p className="text-sm text-gray-600">{meals.almoco.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.almoco.recipeName || (meals.almoco.items && meals.almoco.items.length > 0 
                        ? `${meals.almoco.items.length} item(ns)` 
                        : 'Não definido')}
                    </p>
                  </div>
                )}
                {meals.lancheTarde && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Lanche da tarde</p>
                      <p className="text-sm text-gray-600">{meals.lancheTarde.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.lancheTarde.recipeName || (meals.lancheTarde.items && meals.lancheTarde.items.length > 0 
                        ? `${meals.lancheTarde.items.length} item(ns)` 
                        : 'Não definido')}
                    </p>
                  </div>
                )}
                {meals.jantar && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Jantar</p>
                      <p className="text-sm text-gray-600">{meals.jantar.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.jantar.recipeName || (meals.jantar.items && meals.jantar.items.length > 0 
                        ? `${meals.jantar.items.length} item(ns)` 
                        : 'Não definido')}
                    </p>
                  </div>
                )}
                {meals.posTreino && meals.posTreino.time && (
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">Pós-treino</p>
                      <p className="text-sm text-gray-600">{meals.posTreino.time}</p>
                    </div>
                    <p className="text-gray-700 break-words text-right">
                      {meals.posTreino.recipeName || (meals.posTreino.items && meals.posTreino.items.length > 0 
                        ? `${meals.posTreino.items.length} item(ns)` 
                        : 'Whey')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Hábitos */}
          {activeTab === 'habitos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">✨ Hábitos</h2>
                <span className="text-xl font-bold text-purple-600">{habitsProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${habitsProgress}%` }}
                />
              </div>
              {dailyHabits.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhum hábito cadastrado ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {dailyHabits.map(habit => {
                    const value = todayHabits[habit.id];
                    const isComplete = habit.type === 'boolean' 
                      ? value === true
                      : (value || 0) >= habit.target;

                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between py-2 border-b last:border-0 ${
                          isComplete ? 'text-green-600' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{habit.icon}</span>
                          <div>
                            <span className="font-medium">{habit.name}</span>
                            {habit.type === 'quantity' && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({value || 0} / {habit.target})
                              </span>
                            )}
                            {habit.type === 'timesPerDay' && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({value || 0} / {habit.target} vezes hoje)
                              </span>
                            )}
                            {habit.type === 'timesPerWeek' && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({value || 0} / {habit.target} vezes na semana)
                              </span>
                            )}
                          </div>
                        </div>
                        {isComplete ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-400">○</span>
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
