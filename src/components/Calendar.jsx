import { useState } from 'react';
import { getDayProgress, getProgressColor } from '../utils/calculations';

export default function Calendar({ checklist, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primeiro dia do mês
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDate = today.getDate();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{monthNames[month]} {year}</h3>
          {isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-sm text-blue-600 hover:underline"
            >
              Hoje
            </button>
          )}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios antes do primeiro dia */}
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Dias do mês */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const progress = getDayProgress(checklist, dateStr);
          const color = getProgressColor(progress);
          const isToday = isCurrentMonth && day === todayDate;

          return (
            <button
              key={day}
              onClick={() => onDateSelect && onDateSelect(dateStr)}
              className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                isToday
                  ? 'ring-2 ring-blue-500'
                  : ''
              } ${
                color === 'green'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : color === 'yellow'
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  : progress > 0
                  ? 'bg-red-400 text-white hover:bg-red-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`${day}/${month + 1}: ${progress}%`}
            >
              <div>{day}</div>
              {progress > 0 && (
                <div className="text-xs mt-0.5">{progress}%</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>80-100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          <span>50-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-400"></div>
          <span>1-49%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-100"></div>
          <span>0%</span>
        </div>
      </div>
    </div>
  );
}

