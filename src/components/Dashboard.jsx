import { useState, useEffect } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { getCurrentDayData, calculateWeekProgress, calculateMonthProgress, calculateYearProgress, calculateDayProgressWithHabits } from '../utils/calculations';
import Calendar from './Calendar';
import ProgressCircle from './ProgressCircle';

function SyncData({ data, updateData }) {
  const [showSync, setShowSync] = useState(false);
  const [importText, setImportText] = useState('');
  const [userId, setUserId] = useState(() => {
    // Gerar ou recuperar ID do usuário
    let id = localStorage.getItem('app-dieta-user-id');
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('app-dieta-user-id', id);
    }
    return id;
  });

  const {
    isConnected,
    isSyncing,
    lastSync,
    error: syncError,
    syncToFirebase,
    syncFromFirebase
  } = useFirebaseSync(userId, data, updateData);

  const exportData = () => {
    const dataToExport = JSON.stringify(data, null, 2);
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-dieta-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    try {
      const importedData = JSON.parse(importText);
      if (confirm('Isso irá substituir todos os dados atuais. Continuar?')) {
        updateData(importedData);
        setImportText('');
        setShowSync(false);
        alert('Dados importados com sucesso!');
      }
    } catch (error) {
      alert('Erro ao importar dados. Verifique se o formato está correto.');
    }
  };

  if (!showSync) {
    return (
      <button
        onClick={() => setShowSync(true)}
        className="fixed top-4 right-4 px-3 py-2 text-white rounded-lg text-sm font-medium z-40"
        style={{ backgroundColor: '#4f6d7a' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
      >
        🔄 Sincronizar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sincronizar Dados</h2>
          <button
            onClick={() => setShowSync(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Sincronização Online */}
          <div>
            <h3 className="font-semibold mb-2">Sincronização Online</h3>
            {syncError && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                {syncError.includes('não configurado') ? (
                  <div>
                    <p className="font-semibold mb-1">Firebase não configurado</p>
                    <p>Para usar sincronização online, configure o Firebase:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Acesse <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                      <li>Crie um projeto e ative Realtime Database</li>
                      <li>Copie as configurações para <code className="bg-gray-100 px-1 rounded">src/config/firebase.js</code></li>
                    </ol>
                  </div>
                ) : (
                  syncError
                )}
              </div>
            )}
            <div className="mb-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </span>
              </div>
              {lastSync && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Última sincronização:</span>
                  <span>{lastSync.toLocaleTimeString('pt-BR')}</span>
                </div>
              )}
              {isSyncing && (
                <div className="text-xs text-blue-600">Sincronizando...</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await syncToFirebase();
                  alert('Dados sincronizados com sucesso!');
                }}
                disabled={!isConnected || isSyncing}
                className="flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: isConnected && !isSyncing ? '#4f6d7a' : '#eaeaea' }}
                onMouseEnter={(e) => {
                  if (isConnected && !isSyncing) e.target.style.backgroundColor = '#dd6e42';
                }}
                onMouseLeave={(e) => {
                  if (isConnected && !isSyncing) e.target.style.backgroundColor = '#4f6d7a';
                }}
              >
                {isSyncing ? '⏳ Sincronizando...' : '☁️ Enviar para Nuvem'}
              </button>
              <button
                onClick={async () => {
                  await syncFromFirebase();
                  alert('Dados baixados com sucesso!');
                }}
                disabled={!isConnected || isSyncing}
                className="flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: isConnected && !isSyncing ? '#4f6d7a' : '#eaeaea' }}
                onMouseEnter={(e) => {
                  if (isConnected && !isSyncing) e.target.style.backgroundColor = '#dd6e42';
                }}
                onMouseLeave={(e) => {
                  if (isConnected && !isSyncing) e.target.style.backgroundColor = '#4f6d7a';
                }}
              >
                {isSyncing ? '⏳ Sincronizando...' : '⬇️ Baixar da Nuvem'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ID do usuário: <code className="bg-gray-100 px-1 rounded">{userId}</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use o mesmo ID em outro dispositivo para sincronizar automaticamente.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Exportar/Importar Manual</h3>
            <p className="text-sm text-gray-600 mb-2">
              Exporte seus dados para salvar em outro dispositivo ou fazer backup.
            </p>
            <button
              onClick={exportData}
              className="w-full px-4 py-2 text-white rounded-lg font-medium mb-2"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
            >
              📥 Exportar Dados
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Importar Dados</h3>
            <p className="text-sm text-gray-600 mb-2">
              Cole os dados exportados de outro dispositivo aqui.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Cole os dados JSON aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              rows="6"
            />
            <button
              onClick={importData}
              disabled={!importText.trim()}
              className="w-full mt-2 px-4 py-2 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: importText.trim() ? '#4f6d7a' : '#eaeaea' }}
              onMouseEnter={(e) => {
                if (importText.trim()) e.target.style.backgroundColor = '#dd6e42';
              }}
              onMouseLeave={(e) => {
                if (importText.trim()) e.target.style.backgroundColor = '#4f6d7a';
              }}
            >
              📤 Importar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, updateData } = useStorage();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  if (loading || !data) {
    return <div className="p-4">Carregando...</div>;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayData = getCurrentDayData(data.checklist, data.planner);
  const customChecklistItems = data.customChecklistItems || [];
  
  // Calcular progresso de alimentação separadamente
  const calculateFoodProgress = (checklistItems, customItems) => {
    if (!checklistItems) return 0;
    if (customItems && customItems.length > 0) {
      let totalProgress = 0;
      let itemsCount = 0;
      const waterValue = checklistItems['agua'] || 0;
      if (waterValue !== undefined) {
        const waterProgress = Math.min((waterValue / 3000) * 100, 100);
        totalProgress += waterProgress;
        itemsCount += 1;
      }
      customItems.forEach(item => {
        if (item.key === 'agua') return;
        const value = checklistItems[item.key] || 0;
        const max = item.max || 1;
        const itemProgress = value >= max ? 100 : 0;
        totalProgress += itemProgress;
        itemsCount += 1;
      });
      return itemsCount > 0 ? Math.round(totalProgress / itemsCount) : 0;
    }
    return 0;
  };

  const calculateHabitsProgress = (habits, dailyHabits) => {
    if (!dailyHabits || dailyHabits.length === 0) return 0;
    const completed = dailyHabits.filter(h => {
      const value = habits[h.id];
      if (h.type === 'boolean') return value === true;
      if (h.type === 'quantity' || h.type === 'timesPerDay' || h.type === 'timesPerWeek') {
        return (value || 0) >= h.target;
      }
      return false;
    }).length;
    return Math.round((completed / dailyHabits.length) * 100);
  };

  const todayFoodProgress = todayData.checklist ? calculateFoodProgress(todayData.checklist.items, customChecklistItems) : 0;
  const todayHabitsProgress = calculateHabitsProgress(todayHabits, dailyHabits);
  
  // Calcular semana, mês e ano com alimentação apenas
  const weekProgress = calculateWeekProgress(data.checklist, customChecklistItems);
  const monthProgress = calculateMonthProgress(data.checklist, today.getFullYear(), today.getMonth(), customChecklistItems);
  const yearProgress = calculateYearProgress(data.checklist, today.getFullYear(), customChecklistItems);
  
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

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        <SyncData data={data} updateData={updateData} />
      </div>

      {/* Progresso - Círculos */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="relative flex items-center justify-center">
            <ProgressCircle 
              percentage={todayFoodProgress} 
              label="Dia"
              size={70}
            />
          </div>
          <div className="relative flex items-center justify-center">
            <ProgressCircle 
              percentage={weekProgress} 
              label="Semana"
              size={70}
            />
          </div>
          <div className="relative flex items-center justify-center">
            <ProgressCircle 
              percentage={monthProgress} 
              label="Mês"
              size={70}
            />
          </div>
          <div className="relative flex items-center justify-center">
            <ProgressCircle 
              percentage={yearProgress} 
              label="Ano"
              size={70}
            />
          </div>
        </div>
        {/* Progresso separado do dia */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Alimentação</div>
            <div className="text-2xl font-bold" style={{ color: '#4f6d7a' }}>{todayFoodProgress}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Hábitos</div>
            <div className="text-2xl font-bold" style={{ color: '#4f6d7a' }}>{todayHabitsProgress}%</div>
          </div>
        </div>
      </div>

      {/* Calendário Mensal */}
      <Calendar 
        checklist={data.checklist || []}
        dailyHabits={dailyHabits}
        onDateSelect={(date) => setSelectedCalendarDate(date)}
      />

      {selectedCalendarDate && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#c0d6df', borderColor: '#4f6d7a', color: '#4f6d7a' }}>
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

      {/* Alimentação e Hábitos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {/* Alimentação */}
          <div className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">🍽️ Alimentação</h2>
                <span className="text-xl font-bold" style={{ color: '#4f6d7a' }}>{todayFoodProgress}%</span>
              </div>
              <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: '#eaeaea' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${todayFoodProgress}%`, backgroundColor: '#4f6d7a' }}
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
          </div>

          {/* Hábitos */}
          <div className="border-t pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">✨ Hábitos</h2>
                <span className="text-xl font-bold" style={{ color: '#4f6d7a' }}>{todayHabitsProgress}%</span>
              </div>
              <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: '#eaeaea' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${todayHabitsProgress}%`, backgroundColor: '#4f6d7a' }}
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
          </div>
        </div>
      </div>
    </div>
  );
}
