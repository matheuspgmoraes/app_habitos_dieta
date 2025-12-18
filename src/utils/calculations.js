// Cálculos de porcentagens e progresso

export function calculateDayProgress(checklistItems, customItems = null) {
  // Se customItems fornecido, usar novo formato (barras de progresso)
  if (customItems && customItems.length > 0) {
    let totalProgress = 0;
    let itemsCount = 0;
    
    // Adicionar água separadamente se existir
    const waterValue = checklistItems['agua'] || 0;
    if (waterValue !== undefined) {
      const waterProgress = Math.min((waterValue / 3000) * 100, 100);
      totalProgress += waterProgress;
      itemsCount += 1;
    }
    
    customItems.forEach(item => {
      if (item.key === 'agua') return; // Água já foi processada
      const value = checklistItems[item.key] || 0;
      const max = item.max || 1;
      // Para refeições (0-1), considerar completo se >= 1
      const itemProgress = value >= max ? 100 : 0;
      totalProgress += itemProgress;
      itemsCount += 1;
    });
    
    return itemsCount > 0 ? Math.round(totalProgress / itemsCount) : 0;
  }
  
  // Formato antigo (checkboxes)
  const total = Object.keys(checklistItems).length;
  let completed = 0;
  Object.entries(checklistItems).forEach(([key, value]) => {
    if (key === 'agua') {
      if (value >= 3) completed += 1;
      else if (value > 0) completed += value / 3;
    } else {
      if (value) completed += 1;
    }
  });
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function calculateWeekProgress(checklist, customItems = null) {
  if (!checklist || checklist.length === 0) return 0;
  
  // Obter apenas os últimos 7 dias (semana atual)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Domingo da semana
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  const weekDays = checklist.filter(day => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate >= weekStart && dayDate < weekEnd;
  });
  
  if (weekDays.length === 0) return 0;
  
  let totalProgress = 0;
  let daysCount = 0;
  
  weekDays.forEach(day => {
    const dayProgress = calculateDayProgress(day.items, customItems);
    totalProgress += dayProgress;
    daysCount += 1;
  });
  
  return daysCount > 0 ? Math.round(totalProgress / daysCount) : 0;
}

export function calculateMonthProgress(checklist, year, month, customItems = null) {
  if (!checklist || checklist.length === 0) return 0;
  
  const monthDays = checklist.filter(day => {
    try {
      const date = new Date(day.date);
      // Garantir que estamos comparando corretamente
      return date.getFullYear() === year && date.getMonth() === month;
    } catch (e) {
      return false;
    }
  });
  
  if (monthDays.length === 0) return 0;
  
  let totalProgress = 0;
  let daysCount = 0;
  
  monthDays.forEach(day => {
    const dayProgress = calculateDayProgress(day.items, customItems);
    totalProgress += dayProgress;
    daysCount += 1;
  });
  
  return daysCount > 0 ? Math.round(totalProgress / daysCount) : 0;
}

export function calculateYearProgress(checklist, year, customItems = null) {
  if (!checklist || checklist.length === 0) return 0;
  
  const yearDays = checklist.filter(day => {
    try {
      const date = new Date(day.date);
      // Garantir que estamos comparando corretamente
      return date.getFullYear() === year;
    } catch (e) {
      return false;
    }
  });
  
  if (yearDays.length === 0) return 0;
  
  let totalProgress = 0;
  let daysCount = 0;
  
  yearDays.forEach(day => {
    const dayProgress = calculateDayProgress(day.items, customItems);
    totalProgress += dayProgress;
    daysCount += 1;
  });
  
  return daysCount > 0 ? Math.round(totalProgress / daysCount) : 0;
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

// Calcular progresso incluindo hábitos
export function calculateDayProgressWithHabits(checklistItems, habits = {}, dailyHabits = []) {
  const foodItems = ['cafe', 'lancheManha', 'almoco', 'lancheTarde', 'jantar', 'posTreino', 'creatina', 'agua'];
  let foodCompleted = 0;
  let foodTotal = foodItems.length;
  
  foodItems.forEach(key => {
    if (key === 'agua') {
      if ((checklistItems?.agua || 0) >= 3) foodCompleted += 1;
      else if ((checklistItems?.agua || 0) > 0) foodCompleted += (checklistItems.agua || 0) / 3;
    } else {
      if (checklistItems?.[key]) foodCompleted += 1;
    }
  });
  
  const foodProgress = foodTotal > 0 ? (foodCompleted / foodTotal) : 0;
  
  // Calcular progresso de hábitos
  let habitsCompleted = 0;
  const habitsTotal = dailyHabits.length;
  
  if (habitsTotal > 0) {
    dailyHabits.forEach(habit => {
      const value = habits[habit.id];
      let isComplete = false;
      if (habit.type === 'boolean') {
        isComplete = value === true;
      } else if (habit.type === 'quantity' || habit.type === 'timesPerDay' || habit.type === 'timesPerWeek') {
        isComplete = (value || 0) >= habit.target;
      }
      if (isComplete) habitsCompleted += 1;
    });
  }
  
  const habitsProgress = habitsTotal > 0 ? (habitsCompleted / habitsTotal) : 0;
  
  // Progresso total: média ponderada (alimentação 60%, hábitos 40%)
  const totalProgress = (foodProgress * 0.6) + (habitsProgress * 0.4);
  
  return Math.round(totalProgress * 100);
}
