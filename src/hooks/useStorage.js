import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export function useStorage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar dados iniciais
    const loadedData = storage.load();
    
    // Migrar dados antigos: converter workout (string) para activities (array)
    if (loadedData.planner) {
      let needsUpdate = false;
      loadedData.planner.forEach(day => {
        if (day.workout && !day.activities) {
          day.activities = [day.workout];
          delete day.workout;
          needsUpdate = true;
        } else if (!day.activities) {
          day.activities = [];
        }
      });
      if (needsUpdate) {
        storage.save(loadedData);
      }
    }
    
    setData(loadedData);
    setLoading(false);
  }, []);

  const updateData = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    storage.save(updated);
  };

  const updateChecklist = (date, item, checked) => {
    const updated = { ...data };
    const dayIndex = updated.checklist.findIndex(d => d.date === date);
    if (dayIndex !== -1) {
      updated.checklist[dayIndex].items[item] = checked;
      updateData(updated);
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

