import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export function useStorage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Carregar dados iniciais
      const loadedData = storage.load();
      
      // Garantir estrutura básica
      if (!loadedData) {
        const defaultData = {
          checklist: [],
          planner: [],
          recipes: [],
          shoppingList: [],
          history: [],
          activities: {},
          dailyHabits: [],
          ingredients: null,
          customChecklistItems: null
        };
        setData(defaultData);
        setLoading(false);
        return;
      }
      
      // Limpar atividades e hábitos dos dados antigos
      if (loadedData.planner && Array.isArray(loadedData.planner)) {
        let needsUpdate = false;
        loadedData.planner.forEach(day => {
          if (day.activities) {
            delete day.activities;
            needsUpdate = true;
          }
          if (day.workout) {
            delete day.workout;
            needsUpdate = true;
          }
        });
        if (needsUpdate) {
          storage.save(loadedData);
        }
      }
      
      // Remover activities e dailyHabits do objeto principal
      if (loadedData.activities) {
        delete loadedData.activities;
        storage.save(loadedData);
      }
      if (loadedData.dailyHabits) {
        delete loadedData.dailyHabits;
        storage.save(loadedData);
      }
      
      // Garantir que checklist é um array e tem itens para os próximos dias
      if (!Array.isArray(loadedData.checklist)) {
        loadedData.checklist = [];
      }
      
      // Garantir que customChecklistItems existe e tem os itens padrões
      const defaultChecklistItems = [
        { key: 'cafe', label: 'Café da manhã', icon: '☕', max: 1 },
        { key: 'lancheManha', label: 'Lanche da manhã', icon: '🍎', max: 1 },
        { key: 'almoco', label: 'Almoço', icon: '🍽️', max: 1 },
        { key: 'lancheTarde', label: 'Lanche da tarde', icon: '🥗', max: 1 },
        { key: 'jantar', label: 'Jantar', icon: '🍲', max: 1 },
        { key: 'posTreino', label: 'Pós-treino', icon: '🥤', max: 1 },
        { key: 'creatina', label: 'Creatina', icon: '💊', max: 1 }
      ];
      
      if (!loadedData.customChecklistItems || !Array.isArray(loadedData.customChecklistItems) || loadedData.customChecklistItems.length === 0) {
        loadedData.customChecklistItems = [...defaultChecklistItems];
        storage.save(loadedData);
      } else {
        // Garantir que todos os itens padrões estejam presentes
        const defaultKeys = defaultChecklistItems.map(item => item.key);
        const existingKeys = loadedData.customChecklistItems.map(item => item.key);
        const missingKeys = defaultKeys.filter(key => !existingKeys.includes(key));
        
        if (missingKeys.length > 0) {
          const missingItems = defaultChecklistItems.filter(item => missingKeys.includes(item.key));
          loadedData.customChecklistItems = [...loadedData.customChecklistItems, ...missingItems];
          storage.save(loadedData);
        }
      }
      
      // Garantir que há dias no checklist para os próximos 14 dias
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let needsUpdate = false;
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayExists = loadedData.checklist.find(d => d.date === dateStr);
        if (!dayExists) {
          if (!needsUpdate) {
            needsUpdate = true;
          }
          loadedData.checklist.push({
            date: dateStr,
            items: {
              cafe: 0,
              lancheManha: 0,
              almoco: 0,
              lancheTarde: 0,
              jantar: 0,
              posTreino: 0,
              creatina: 0,
              agua: 0
            }
          });
        } else {
          // Garantir que o dia tem a estrutura correta de items
          if (!dayExists.items) {
            dayExists.items = {
              cafe: 0,
              lancheManha: 0,
              almoco: 0,
              lancheTarde: 0,
              jantar: 0,
              posTreino: 0,
              creatina: 0,
              agua: 0
            };
            needsUpdate = true;
          } else {
            // Garantir que todos os itens padrões existem no dia
            const defaultKeys = ['cafe', 'lancheManha', 'almoco', 'lancheTarde', 'jantar', 'posTreino', 'creatina', 'agua'];
            defaultKeys.forEach(key => {
              if (dayExists.items[key] === undefined || dayExists.items[key] === null) {
                dayExists.items[key] = key === 'agua' ? 0 : 0;
                needsUpdate = true;
              }
            });
          }
        }
      }
      
      // Ordenar checklist por data
      loadedData.checklist.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (needsUpdate) {
        storage.save(loadedData);
      }
      if (!Array.isArray(loadedData.planner)) {
        loadedData.planner = [];
      }
      if (!Array.isArray(loadedData.recipes)) {
        loadedData.recipes = [];
      }
      if (!Array.isArray(loadedData.shoppingList)) {
        loadedData.shoppingList = [];
      }
      if (!Array.isArray(loadedData.history)) {
        loadedData.history = [];
      }
      
      setData(loadedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Dados padrão em caso de erro
      const defaultData = {
        checklist: [],
        planner: [],
        recipes: [],
        shoppingList: [],
        history: [],
        ingredients: null,
        customChecklistItems: null
      };
      setData(defaultData);
      setLoading(false);
    }
  }, []);

  const updateData = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    storage.save(updated);
  };

  const updateChecklist = (date, item, checked) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data)); // Deep copy para evitar mutação
    let dayIndex = updated.checklist.findIndex(d => d && d.date === date);
    
    // Se o dia não existe, criar
    if (dayIndex === -1) {
      updated.checklist.push({
        date: date,
        items: {}
      });
      dayIndex = updated.checklist.length - 1;
    }
    
    if (dayIndex !== -1) {
      if (!updated.checklist[dayIndex].items) {
        updated.checklist[dayIndex].items = {};
      }
      // Se o valor for 0, podemos definir como 0 ou remover a propriedade
      // Vamos definir como 0 para manter consistência
      updated.checklist[dayIndex].items[item] = checked;
      
      // Salvar e atualizar estado
      storage.save(updated);
      setData(updated);
    }
  };

  const updatePlanner = (date, meal, mealData) => {
    const updated = { ...data };
    let dayIndex = updated.planner.findIndex(d => d.date === date);
    
    // Se o dia não existe, criar
    if (dayIndex === -1) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const newDay = {
        date: date,
        meals: {
          cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
          lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
          almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
          lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
          jantar: { time: dayOfWeek === 1 || dayOfWeek === 3 ? '18:00' : '18:30', recipeId: null, recipeName: null, items: [] },
          posTreino: { time: (dayOfWeek === 1 || dayOfWeek === 3) ? '22:00' : null, recipeId: null, recipeName: null, items: [] }
        },
        activities: []
      };
      updated.planner.push(newDay);
      updated.planner.sort((a, b) => new Date(a.date) - new Date(b.date));
      dayIndex = updated.planner.findIndex(d => d.date === date);
    }
    
    if (dayIndex !== -1) {
      updated.planner[dayIndex].meals[meal] = mealData;
      updateData(updated);
    }
  };

  const addToShoppingList = (item) => {
    const updated = { ...data };
    if (!updated.shoppingList.find(i => i.name === item.name)) {
      updated.shoppingList.push({ ...item, checked: false });
      updateData(updated);
    }
  };

  const updateShoppingList = (index, checked) => {
    const updated = { ...data };
    updated.shoppingList[index].checked = checked;
    updateData(updated);
  };

  const saveHistory = (weekData) => {
    const updated = { ...data };
    updated.history.push({
      weekStart: weekData.weekStart,
      dailyPercentages: weekData.dailyPercentages,
      weeklyPercentage: weekData.weeklyPercentage,
      date: new Date().toISOString()
    });
    updateData(updated);
  };

  const removeShoppingItem = (index) => {
    const updated = { ...data };
    updated.shoppingList.splice(index, 1);
    updateData(updated);
  };

  const clearCheckedItems = () => {
    const updated = { ...data };
    updated.shoppingList = updated.shoppingList.filter(item => !item.checked);
    updateData(updated);
  };

  const addRecipe = (recipe) => {
    const updated = { ...data };
    recipe.id = `recipe-${Date.now()}`;
    updated.recipes.push(recipe);
    updateData(updated);
  };

  const updateRecipe = (recipeId, recipe) => {
    const updated = { ...data };
    const index = updated.recipes.findIndex(r => r.id === recipeId);
    if (index !== -1) {
      updated.recipes[index] = { ...updated.recipes[index], ...recipe };
      updateData(updated);
    }
  };

  const deleteRecipe = (recipeId) => {
    const updated = { ...data };
    updated.recipes = updated.recipes.filter(r => r.id !== recipeId);
    updateData(updated);
  };

  const updateWeeklyPrep = (day, tasks) => {
    const updated = { ...data };
    if (!updated.weeklyPrep) updated.weeklyPrep = {};
    updated.weeklyPrep[day] = tasks;
    updateData(updated);
  };

  return {
    data,
    loading,
    updateData,
    updateChecklist,
    updatePlanner,
    addToShoppingList,
    updateShoppingList,
    removeShoppingItem,
    clearCheckedItems,
    saveHistory,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    updateWeeklyPrep
  };
}

