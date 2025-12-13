import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

const DEFAULT_SUNDAY_TASKS = [
  { task: 'Cozinhar ovos', icon: '🥚' },
  { task: 'Preparar frango (várias versões)', icon: '🍗' },
  { task: 'Preparar sanduíches para congelar', icon: '🥪' },
  { task: 'Cortar legumes', icon: '🥕' },
  { task: 'Preparar almôndegas', icon: '🍖' },
  { task: 'Porcionar tudo', icon: '📦' },
  { task: 'Organizar frutas da semana', icon: '🍎' }
];

const DEFAULT_WEDNESDAY_TASKS = [
  { task: 'Repor ovos', icon: '🥚' },
  { task: 'Repor frango', icon: '🍗' },
  { task: 'Repor sanduíches', icon: '🥪' },
  { task: 'Revisar saladas', icon: '🥗' }
];

export default function WeeklyPrep() {
  const { data, updateWeeklyPrep } = useStorage();
  const [editingDay, setEditingDay] = useState(null);
  const [newTask, setNewTask] = useState('');

  if (!data) return <div className="p-4">Carregando...</div>;

  const sundayTasks = data.weeklyPrep?.sunday || DEFAULT_SUNDAY_TASKS;
  const wednesdayTasks = data.weeklyPrep?.wednesday || DEFAULT_WEDNESDAY_TASKS;

  const handleAddTask = (day) => {
    if (!newTask.trim()) return;
    
    const task = { task: newTask.trim(), icon: '📝' };
    const currentTasks = day === 'sunday' ? sundayTasks : wednesdayTasks;
    const updatedTasks = [...currentTasks, task];
    
    updateWeeklyPrep(day, updatedTasks);
    setNewTask('');
  };

  const handleRemoveTask = (day, index) => {
    const currentTasks = day === 'sunday' ? sundayTasks : wednesdayTasks;
    const updatedTasks = currentTasks.filter((_, i) => i !== index);
    updateWeeklyPrep(day, updatedTasks);
  };

  const handleEditTask = (day, index, newText) => {
    const currentTasks = day === 'sunday' ? sundayTasks : wednesdayTasks;
    const updatedTasks = [...currentTasks];
    updatedTasks[index] = { ...updatedTasks[index], task: newText };
    updateWeeklyPrep(day, updatedTasks);
  };

  return (
    <div className="p-4 space-y-6 pb-20 overflow-x-hidden">
      <h1 className="text-2xl font-bold text-gray-900">Preparo da Semana</h1>

      {/* Domingo */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span>📅</span>
            <span>Domingo - Preparo Completo</span>
          </h2>
          <button
            onClick={() => setEditingDay(editingDay === 'sunday' ? null : 'sunday')}
            className="px-3 py-1 text-white rounded text-sm"
            style={{ backgroundColor: '#4f6d7a' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
          >
            {editingDay === 'sunday' ? 'Concluir' : 'Editar'}
          </button>
        </div>

        {/* Adicionar nova tarefa */}
        {editingDay === 'sunday' && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask('sunday')}
              placeholder="Nova tarefa..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => handleAddTask('sunday')}
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
            >
              +
            </button>
          </div>
        )}

        <div className="space-y-3">
          {sundayTasks.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-2xl">{item.icon}</span>
              {editingDay === 'sunday' ? (
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={item.task}
                    onChange={(e) => handleEditTask('sunday', idx, e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleRemoveTask('sunday', idx)}
                    className="px-2 py-1 text-white rounded text-sm flex-shrink-0"
                    style={{ backgroundColor: '#dd6e42' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c55a2e'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dd6e42'}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="font-medium text-gray-700 flex-1 break-words min-w-0">{item.task}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quarta */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span>📅</span>
            <span>Quarta - Reposição</span>
          </h2>
          <button
            onClick={() => setEditingDay(editingDay === 'wednesday' ? null : 'wednesday')}
            className="px-3 py-1 text-white rounded text-sm"
            style={{ backgroundColor: '#4f6d7a' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
          >
            {editingDay === 'wednesday' ? 'Concluir' : 'Editar'}
          </button>
        </div>

        {/* Adicionar nova tarefa */}
        {editingDay === 'wednesday' && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask('wednesday')}
              placeholder="Nova tarefa..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => handleAddTask('wednesday')}
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#4f6d7a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6e42'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f6d7a'}
            >
              +
            </button>
          </div>
        )}

        <div className="space-y-3">
          {wednesdayTasks.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-2xl">{item.icon}</span>
              {editingDay === 'wednesday' ? (
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={item.task}
                    onChange={(e) => handleEditTask('wednesday', idx, e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleRemoveTask('wednesday', idx)}
                    className="px-2 py-1 text-white rounded text-sm flex-shrink-0"
                    style={{ backgroundColor: '#dd6e42' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c55a2e'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dd6e42'}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="font-medium text-gray-700 flex-1 break-words min-w-0">{item.task}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dicas */}
      <div className="rounded-lg shadow p-4 border" style={{ backgroundColor: '#c0d6df', borderColor: '#4f6d7a' }}>
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Congele os sanduíches individualmente para facilitar o descongelamento</li>
          <li>• Porcione as refeições em potes de vidro ou plástico</li>
          <li>• Mantenha as frutas organizadas por tipo para facilitar o acesso</li>
          <li>• Prepare mais quantidade no domingo para durar até quarta</li>
        </ul>
      </div>
    </div>
  );
}
