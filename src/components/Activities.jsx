import { useState } from 'react';
import { useStorage } from '../hooks/useStorage';

export default function Activities() {
  const { data, updateData } = useStorage();
  const [editingId, setEditingId] = useState(null);
  const [newActivity, setNewActivity] = useState({ 
    name: '', 
    icon: '💪', 
    time: '',
    daysOfWeek: [] // Array de dias: 0=domingo, 1=segunda, etc.
  });

  if (!data) return <div className="p-4">Carregando...</div>;

  const activities = data.activities || {
    vôlei: { name: 'Vôlei', icon: '🏐', time: '20:00', daysOfWeek: [1, 3] },
    academia: { name: 'Academia', icon: '💪', time: null, daysOfWeek: [2, 4, 5, 6] }
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleSave = (id, activityData) => {
    const updated = { ...data };
    if (!updated.activities) updated.activities = {};
    updated.activities[id] = activityData;
    updateData(updated);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newActivity.name.trim()) return;
    const id = `activity-${Date.now()}`;
    const updated = { ...data };
    if (!updated.activities) updated.activities = {};
    updated.activities[id] = {
      name: newActivity.name.trim(),
      icon: newActivity.icon || '💪',
      time: newActivity.time || null,
      daysOfWeek: newActivity.daysOfWeek || []
    };
    updateData(updated);
    setNewActivity({ name: '', icon: '💪', time: '', daysOfWeek: [] });
  };

  const toggleDay = (activityId, day) => {
    const activity = activities[activityId];
    const daysOfWeek = activity.daysOfWeek || [];
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort();
    handleSave(activityId, { ...activity, daysOfWeek: newDays });
  };

  const handleDelete = (id) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
    const updated = { ...data };
    delete updated.activities[id];
    updateData(updated);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>

      {/* Adicionar nova atividade */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Nova Atividade</h2>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newActivity.icon}
              onChange={(e) => setNewActivity({ ...newActivity, icon: e.target.value })}
              placeholder="Emoji"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl"
              maxLength="2"
            />
            <input
              type="text"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              placeholder="Nome (ex: Vôlei)"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={newActivity.time}
              onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
              placeholder="Horário (ex: 20:00)"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              +
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Dias da semana (opcional):</p>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((dayName, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => {
                    const daysOfWeek = newActivity.daysOfWeek || [];
                    const newDays = daysOfWeek.includes(dayIndex)
                      ? daysOfWeek.filter(d => d !== dayIndex)
                      : [...daysOfWeek, dayIndex].sort();
                    setNewActivity({ ...newActivity, daysOfWeek: newDays });
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    (newActivity.daysOfWeek || []).includes(dayIndex)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dayName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-3">
        {Object.entries(activities).map(([id, activity]) => {
          const isEditing = editingId === id;
          return (
            <div key={id} className="bg-white rounded-lg shadow p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      value={activity.icon}
                      onChange={(e) => handleSave(id, { ...activity, icon: e.target.value })}
                      className="w-20 px-2 py-2 border border-gray-300 rounded text-center text-xl"
                      maxLength="2"
                    />
                    <input
                      type="text"
                      value={activity.name}
                      onChange={(e) => handleSave(id, { ...activity, name: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={activity.time || ''}
                      onChange={(e) => handleSave(id, { ...activity, time: e.target.value || null })}
                      placeholder="Horário"
                      className="w-24 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-green-600 text-white rounded"
                    >
                      ✓
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Dias da semana:</p>
                    <div className="flex flex-wrap gap-2">
                      {dayNames.map((dayName, dayIndex) => (
                        <button
                          key={dayIndex}
                          onClick={() => toggleDay(id, dayIndex)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            (activity.daysOfWeek || []).includes(dayIndex)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {dayName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activity.icon}</span>
                      <div>
                        <p className="font-semibold text-lg">{activity.name}</p>
                        {activity.time && (
                          <p className="text-sm text-gray-600">às {activity.time}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {(activity.daysOfWeek || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Dias:</span>
                      {(activity.daysOfWeek || []).map(day => (
                        <span key={day} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {dayNames[day]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

