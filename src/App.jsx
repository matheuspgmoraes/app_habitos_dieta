import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Checklist from './components/Checklist';
import RecipesAndMore from './components/RecipesAndMore';
import Navigation from './components/Navigation';
import { useStorage } from './hooks/useStorage';
import { getWeekStart } from './utils/storage';
import { calculateDayProgress, calculateWeekProgress } from './utils/calculations';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // Mantém 'dashboard' internamente, mas mostra 'Home' na UI
  const { data, saveHistory } = useStorage();

  // Salvar histórico ao final da semana
  useEffect(() => {
    if (!data || !data.history || !data.checklist) return;

    try {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      // Verificar se já salvou histórico para esta semana
      const hasHistory = Array.isArray(data.history) && data.history.some(h => h.weekStart === weekStartStr);
      
      if (!hasHistory && Array.isArray(data.checklist) && data.checklist.length > 0) {
        // Calcular porcentagens diárias
        const dailyPercentages = data.checklist.map(day => 
          calculateDayProgress(day.items || {})
        );
        const weeklyPercentage = calculateWeekProgress(data.checklist);

        // Salvar histórico no domingo à noite
        if (today.getDay() === 0 && today.getHours() >= 22) {
          saveHistory({
            weekStart: weekStartStr,
            dailyPercentages,
            weeklyPercentage
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar histórico:', error);
    }
  }, [data, saveHistory]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'planner':
        return <Planner />;
      case 'checklist':
        return <Checklist />;
      case 'recipes-more':
        return <RecipesAndMore />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg overflow-x-hidden">
        {renderPage()}
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;
