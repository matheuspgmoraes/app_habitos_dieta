import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getWeekStart } from '../utils/storage';
import { calculateDayProgress, calculateWeekProgress } from '../utils/calculations';
import DraggableProgressBar from './DraggableProgressBar';

export default function Checklist() {
  const { data, updateChecklist, updateData } = useStorage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFoodEditor, setShowFoodEditor] = useState(false);
  const [actionHistory, setActionHistory] = useState([]); // Histórico de ações para desfazer
  const [editingItem, setEditingItem] = useState(null); // Item sendo editado
  const [newFoodItem, setNewFoodItem] = useState({
    label: '',
    icon: '🍽️',
    max: 1
  });

  if (!data) return <div className="p-4">Carregando...</div>;

  // Checklist items padrões
  const defaultChecklistItems = [
    { key: 'cafe', label: 'Café da manhã', icon: '☕', max: 1 },
    { key: 'lancheManha', label: 'Lanche da manhã', icon: '🍎', max: 1 },
    { key: 'almoco', label: 'Almoço', icon: '🍽️', max: 1 },
    { key: 'lancheTarde', label: 'Lanche da tarde', icon: '🥗', max: 1 },
    { key: 'jantar', label: 'Jantar', icon: '🍲', max: 1 },
    { key: 'posTreino', label: 'Pós-treino', icon: '🥤', max: 1 },
    { key: 'creatina', label: 'Creatina', icon: '💊', max: 1 }
  ];

  // Checklist items customizáveis (carregar do storage ou usar padrão)
  let customChecklistItems = data.customChecklistItems || [];
  
  // Se não houver customChecklistItems, inicializar com os padrões
  if (!customChecklistItems || customChecklistItems.length === 0) {
    customChecklistItems = [...defaultChecklistItems];
    // Salvar os itens padrões
    const updated = { ...data };
    updated.customChecklistItems = customChecklistItems;
    updateData(updated);
  } else {
    // Garantir que todos os itens padrões estejam presentes
    const defaultKeys = defaultChecklistItems.map(item => item.key);
    const existingKeys = customChecklistItems.map(item => item.key);
    const missingKeys = defaultKeys.filter(key => !existingKeys.includes(key));
    
    if (missingKeys.length > 0) {
      const missingItems = defaultChecklistItems.filter(item => missingKeys.includes(item.key));
      customChecklistItems = [...customChecklistItems, ...missingItems];
      const updated = { ...data };
      updated.customChecklistItems = customChecklistItems;
      updateData(updated);
    }
  }

  const weekStart = getWeekStart(new Date());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    week.push(date.toISOString().split('T')[0]);
  }

  // Recalcular selectedDay sempre que data ou selectedDate mudar
  const selectedDay = data?.checklist?.find(d => d && d.date === selectedDate) || null;
  const dayProgress = selectedDay ? calculateDayProgress(selectedDay.items || {}, customChecklistItems) : 0;
  const weekProgress = calculateWeekProgress(data?.checklist || [], customChecklistItems);


  const handleProgressChange = (itemKey, value) => {
    // Pegar o valor atual diretamente dos dados para garantir que está atualizado
    const currentDay = data?.checklist?.find(d => d && d.date === selectedDate);
    const oldValue = currentDay?.items?.[itemKey] || 0;
    
    // Salvar no histórico antes de atualizar
    setActionHistory(prev => [...prev, {
      type: 'item',
      date: selectedDate,
      key: itemKey,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    }]);
    
    // Atualizar o checklist
    updateChecklist(selectedDate, itemKey, value);
  };

  const handleWaterChange = (value) => {
    const oldValue = selectedDay?.items?.agua || 0;
    // Salvar no histórico antes de atualizar
    setActionHistory(prev => [...prev, {
      type: 'water',
      date: selectedDate,
      oldValue,
      newValue: parseFloat(value),
      timestamp: Date.now()
    }]);
    updateChecklist(selectedDate, 'agua', parseFloat(value));
  };

  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    const lastAction = actionHistory[actionHistory.length - 1];
    if (lastAction.type === 'item') {
      updateChecklist(lastAction.date, lastAction.key, lastAction.oldValue);
    } else if (lastAction.type === 'water') {
      updateChecklist(lastAction.date, 'agua', lastAction.oldValue);
    }
    setActionHistory(prev => prev.slice(0, -1));
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
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#eaeaea' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: '#4f6d7a', width: `${week.weeklyPercentage}%` }}
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
        <div className="flex gap-2">
          {actionHistory.length > 0 && (
            <button
              onClick={handleUndo}
              className="px-3 py-1 text-white rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
            >
              ↶ Desfazer
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1 bg-[#eaeaea] rounded-lg text-sm font-medium"
          >
            Histórico
          </button>
        </div>
      </div>

      {/* Progresso da semana */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso da Semana</span>
          <span className="text-lg font-bold" style={{ color: '#4f6d7a' }}>{weekProgress}%</span>
        </div>
        <div className="w-full rounded-full h-3" style={{ backgroundColor: '#eaeaea' }}>
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${weekProgress}%`, backgroundColor: '#4f6d7a' }}
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
            const progress = dayData ? calculateDayProgress(dayData.items, customChecklistItems) : 0;
            
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
                <div className="text-xs mt-1">{progress}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alimentação */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {/* Alimentação */}
          <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: '#4f6d7a' }}>{dayProgress}%</span>
                  <button
                    onClick={() => setShowFoodEditor(!showFoodEditor)}
                    className="px-3 py-1 text-white rounded-lg text-sm font-medium"
                    style={{ backgroundColor: '#4f6d7a' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                  >
                    {showFoodEditor ? 'Fechar' : 'Editar'}
                  </button>
                </div>
              </div>
              <div className="w-full rounded-full h-3 mb-4" style={{ backgroundColor: '#eaeaea' }}>
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: dayProgress + '%', backgroundColor: '#4f6d7a' }}
                ></div>
              </div>

              <div className="space-y-4">
                {/* Editor de itens de alimentação */}
                {showFoodEditor && (
                  <div className="bg-[#eaeaea] rounded-lg p-4 mb-4 border border-[#c0d6df]">
                    <h3 className="font-semibold mb-3">Gerenciar Itens de Alimentação</h3>
                    <div className="space-y-3">
                      {/* Adicionar novo item */}
                      <div className="bg-white rounded p-3">
                        <h4 className="text-sm font-medium mb-2">Adicionar Item</h4>
                        <div className="flex gap-2 flex-wrap">
                          <input
                            type="text"
                            value={newFoodItem.icon}
                            onChange={(e) => setNewFoodItem({ ...newFoodItem, icon: e.target.value })}
                            placeholder="Emoji"
                            className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-xl"
                            maxLength="2"
                          />
                          <input
                            type="text"
                            value={newFoodItem.label}
                            onChange={(e) => setNewFoodItem({ ...newFoodItem, label: e.target.value })}
                            placeholder="Nome do item"
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="number"
                            value={newFoodItem.max}
                            onChange={(e) => setNewFoodItem({ ...newFoodItem, max: parseInt(e.target.value) || 1 })}
                            placeholder="Max"
                            min="1"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => {
                              if (!newFoodItem.label.trim()) return;
                              const updated = { ...data };
                              const newItem = {
                                key: `food-${Date.now()}`,
                                label: newFoodItem.label.trim(),
                                icon: newFoodItem.icon || '🍽️',
                                max: newFoodItem.max || 1
                              };
                              updated.customChecklistItems = [...(updated.customChecklistItems || []), newItem];
                              updateData(updated);
                              setNewFoodItem({ label: '', icon: '🍽️', max: 1 });
                            }}
                            className="px-4 py-2 text-white rounded-lg font-medium"
                            style={{ backgroundColor: '#4f6d7a' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* Lista de itens existentes */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium mb-2">Itens Atuais</h4>
                        {customChecklistItems.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">Nenhum item personalizado ainda</p>
                        ) : (
                          customChecklistItems.map((item) => (
                            <div key={item.key} className="bg-white rounded p-3 border border-gray-200">
                              {editingItem?.key === item.key ? (
                                // Modo de edição
                                <div className="space-y-2">
                                  <div className="flex gap-2 flex-wrap">
                                    <input
                                      type="text"
                                      value={editingItem.icon}
                                      onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                                      placeholder="Emoji"
                                      className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-xl"
                                      maxLength="2"
                                    />
                                    <input
                                      type="text"
                                      value={editingItem.label}
                                      onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                                      placeholder="Nome do item"
                                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                      type="number"
                                      value={editingItem.max}
                                      onChange={(e) => setEditingItem({ ...editingItem, max: parseInt(e.target.value) || 1 })}
                                      placeholder="Max"
                                      min="1"
                                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (!editingItem.label.trim()) {
                                          alert('O nome do item é obrigatório');
                                          return;
                                        }
                                        const updated = JSON.parse(JSON.stringify(data));
                                        const itemIndex = updated.customChecklistItems.findIndex(i => i.key === item.key);
                                        if (itemIndex !== -1) {
                                          updated.customChecklistItems[itemIndex] = {
                                            ...editingItem,
                                            label: editingItem.label.trim()
                                          };
                                          updateData(updated);
                                        }
                                        setEditingItem(null);
                                      }}
                                      className="px-3 py-1 bg-[#4f6d7a] text-white rounded text-xs hover:bg-[#3d5560] flex-1"
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      onClick={() => setEditingItem(null)}
                                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // Modo de visualização
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                                    <span className="font-medium truncate">{item.label}</span>
                                    <span className="text-xs text-gray-500 flex-shrink-0">(max: {item.max})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditingItem({ ...item })}
                                      className="px-2 py-1 bg-[#4f6d7a] text-white rounded text-xs hover:bg-[#3d5560] flex-shrink-0"
                                      title="Editar item"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!confirm('Tem certeza que deseja remover este item de todos os dias?')) return;
                                        const updated = JSON.parse(JSON.stringify(data)); // Deep copy
                                        if (!updated.customChecklistItems) updated.customChecklistItems = [];
                                        updated.customChecklistItems = updated.customChecklistItems.filter(i => i.key !== item.key);
                                        // Limpar valores deste item em todos os dias
                                        if (updated.checklist) {
                                          updated.checklist.forEach(day => {
                                            if (day.items && day.items[item.key]) {
                                              delete day.items[item.key];
                                            }
                                          });
                                        }
                                        updateData(updated);
                                      }}
                                      className="px-2 py-1 bg-[#dd6e42] text-white rounded text-xs hover:bg-red-700 flex-shrink-0"
                                      title="Remover item"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {customChecklistItems.map((item) => {
                  // Recalcular value sempre que renderizar
                  const currentDay = data?.checklist?.find(d => d && d.date === selectedDate);
                  const value = currentDay?.items?.[item.key] || 0;
                  // Se max é 1, usar checkbox
                  const isCheckbox = (item.max || 1) === 1;
                  return (
                    <div key={item.key} className="relative">
                      <DraggableProgressBar
                        value={value}
                        max={item.max || 1}
                        onChange={(newValue) => {
                          handleProgressChange(item.key, newValue);
                        }}
                        label={item.label}
                        icon={item.icon}
                        itemKey={item.key}
                        isCheckbox={isCheckbox}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = currentDay?.items?.[item.key] || 0;
                          if (currentValue > 0) {
                            if (confirm(`Remover ${item.label} apenas deste dia?`)) {
                              handleProgressChange(item.key, 0);
                            }
                          } else {
                            // Se não tem valor, adicionar (marcar)
                            handleProgressChange(item.key, item.max || 1);
                          }
                        }}
                        className={`absolute top-0 right-0 px-2 py-1 text-xs z-10 ${
                          (currentDay?.items?.[item.key] || 0) > 0
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={(currentDay?.items?.[item.key] || 0) > 0 ? "Remover apenas deste dia" : "Adicionar neste dia"}
                      >
                        {(currentDay?.items?.[item.key] || 0) > 0 ? '×' : '+'}
                      </button>
                    </div>
                  );
                })}

                {/* Água com barra arrastável - incrementos de 100ml */}
                <DraggableProgressBar
                  value={waterAmount * 1000} // Converter para ml (0-3000ml = 0-3L)
                  max={3000}
                  onChange={(newValue) => handleWaterChange(newValue / 1000)}
                  label="Água"
                  icon="💧"
                  itemKey="agua"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0ml</span>
                  <span>1500ml</span>
                  <span>3000ml</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
