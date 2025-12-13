// Cálculos de porcentagens e progresso

export function calculateDayProgress(checklistItems) {
  const total = Object.keys(checklistItems).length;
  let completed = 0;
  
  Object.entries(checklistItems).forEach(([key, value]) => {
    if (key === 'agua') {
      // Água: considera completo se >= 3L (100%)
      if (value >= 3) completed += 1;
      else if (value > 0) completed += value / 3; // Proporcional
    } else {
      if (value) completed += 1;
    }
  });
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function calculateWeekProgress(checklist) {
  if (!checklist || checklist.length === 0) return 0;
  
  let totalItems = 0;
  let completedItems = 0;
  
  checklist.forEach(day => {
    const items = Object.values(day.items);
    totalItems += items.length;
    completedItems += items.filter(Boolean).length;
  });
  
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

export function calculateMonthProgress(checklist, year, month) {
  if (!checklist || checklist.length === 0) return 0;
  
  const monthDays = checklist.filter(day => {
    const date = new Date(day.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  if (monthDays.length === 0) return 0;
  
  let totalItems = 0;
  let completedItems = 0;
  
  monthDays.forEach(day => {
    const items = Object.values(day.items);
    totalItems += items.length;
    completedItems += items.filter(Boolean).length;
  });
  
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

export function calculateYearProgress(checklist, year) {
  if (!checklist || checklist.length === 0) return 0;
  
  const yearDays = checklist.filter(day => {
    const date = new Date(day.date);
    return date.getFullYear() === year;
  });
  
  if (yearDays.length === 0) return 0;
  
  let totalItems = 0;
  let completedItems = 0;
  
  yearDays.forEach(day => {
    const items = Object.values(day.items);
    totalItems += items.length;
    completedItems += items.filter(Boolean).length;
  });
  
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

export function getCurrentDayData(checklist, planner) {
  const today = new Date().toISOString().split('T')[0];
  const dayChecklist = checklist.find(d => d.date === today);
  const dayPlanner = planner.find(d => d.date === today);
  
  return {
    checklist: dayChecklist || null,
    planner: dayPlanner || null,
    progress: dayChecklist ? calculateDayProgress(dayChecklist.items) : 0
  };
}

export function getWorkoutForToday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  if (dayOfWeek === 1 || dayOfWeek === 3) return 'vôlei';
  if (dayOfWeek === 2 || dayOfWeek === 5 || dayOfWeek === 6) return 'academia';
  if (dayOfWeek === 4) return 'academia';
  return null;
}

export function isWorkDay(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  return dayOfWeek === 3 || dayOfWeek === 4; // quarta e quinta
}

export function getWorkoutTime(workout, dayOfWeek) {
  if (workout === 'vôlei') return '20:00';
  if (workout === 'academia') {
    if (dayOfWeek === 2 || dayOfWeek === 5) return '16:00'; // terça e sexta
    if (dayOfWeek === 4) return '17:00'; // quinta
    if (dayOfWeek === 6) return 'livre'; // sábado
  }
  return null;
}

// Obter cor baseada na porcentagem
export function getProgressColor(percentage) {
  if (percentage >= 80) return 'green';
  if (percentage >= 50) return 'yellow';
  return 'red';
}

// Obter progresso de um dia específico
export function getDayProgress(checklist, date) {
  const day = checklist.find(d => d.date === date);
  if (!day) return 0;
  return calculateDayProgress(day.items);
}
