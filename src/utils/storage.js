// Sistema de armazenamento usando LocalStorage
const STORAGE_KEY = 'dieta_planner_data';

export const storage = {
  // Salvar dados
  save: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  },

  // Carregar dados
  load: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : getDefaultData();
    } catch (error) {
      console.error('Erro ao carregar:', error);
      return getDefaultData();
    }
  },

  // Limpar dados
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Tarefas padrão de preparo
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

// Dados padrão
function getDefaultData() {
  const today = new Date();
  const weekStart = getWeekStart(today);
  
  return {
    checklist: generateWeekChecklist(weekStart),
    planner: generateWeekPlanner(weekStart),
    recipes: getDefaultRecipes(),
    shoppingList: [],
    history: [],
    weeklyPrep: {
      sunday: DEFAULT_SUNDAY_TASKS,
      wednesday: DEFAULT_WEDNESDAY_TASKS
    },
    ingredients: null // Será inicializado com padrão no componente
  };
}

// Obter início da semana (domingo)
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

// Gerar checklist da semana
function generateWeekChecklist(weekStart) {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    week.push({
      date: date.toISOString().split('T')[0],
      items: {
        cafe: false,
        lancheManha: false,
        almoco: false,
        lancheTarde: false,
        jantar: false,
        posTreino: false,
        creatina: false,
        agua: 0 // Quantidade em litros (0 a 3)
      }
    });
  }
  return week;
}

// Gerar planner da semana
function generateWeekPlanner(weekStart) {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayOfWeek = date.getDay();
    
    week.push({
      date: date.toISOString().split('T')[0],
      meals: {
        cafe: { time: '07:00', recipeId: null, recipeName: null, items: [] },
        lancheManha: { time: '09:00', recipeId: null, recipeName: null, items: [] },
        almoco: { time: '12:30', recipeId: null, recipeName: null, items: [] },
        lancheTarde: { time: '15:30', recipeId: null, recipeName: null, items: [] },
        jantar: { time: dayOfWeek === 1 || dayOfWeek === 3 ? '18:00' : '18:30', recipeId: null, recipeName: null, items: [] },
        posTreino: { time: (dayOfWeek === 1 || dayOfWeek === 3) ? '22:00' : null, recipeId: null, recipeName: null, items: [] }
      },
      activities: [] // Array de IDs de atividades do dia
    });
  }
  return week;
}

// Obter treino do dia
function getWorkoutForDay(dayOfWeek) {
  // 0 = domingo, 1 = segunda, 2 = terça, etc.
  if (dayOfWeek === 1 || dayOfWeek === 3) return 'vôlei'; // segunda e quarta
  if (dayOfWeek === 2 || dayOfWeek === 5 || dayOfWeek === 6) return 'academia'; // terça, sexta, sábado
  if (dayOfWeek === 4) return 'academia'; // quinta
  return null;
}

// Receitas padrão
function getDefaultRecipes() {
  return [
    // Sanduíches
    {
      id: 'sanduiche-1',
      name: 'Sanduíche Natural Clássico',
      category: 'sanduiche',
      prepTime: 15,
      portion: '1 unidade',
      macros: { protein: 25, carbs: 35, fat: 8, kcal: 312 },
      ingredients: ['pão integral', 'frango desfiado', 'alface', 'tomate', 'cebola'],
      instructions: 'Montar sanduíche com todos os ingredientes'
    },
    {
      id: 'sanduiche-2',
      name: 'Sanduíche Natural com Ovo',
      category: 'sanduiche',
      prepTime: 15,
      portion: '1 unidade',
      macros: { protein: 22, carbs: 35, fat: 10, kcal: 328 },
      ingredients: ['pão integral', 'ovos', 'alface', 'tomate'],
      instructions: 'Cozinhar ovos, montar sanduíche'
    },
    {
      id: 'sanduiche-3',
      name: 'Sanduíche Congelável para Airfryer',
      category: 'sanduiche',
      prepTime: 20,
      portion: '4 unidades',
      macros: { protein: 25, carbs: 35, fat: 8, kcal: 312 },
      ingredients: ['pão integral', 'frango desfiado', 'alface', 'tomate', 'cebola'],
      instructions: 'Montar sanduíches, embalar individualmente, congelar. Descongelar e assar na airfryer por 8min a 180°C'
    },
    // Cuscuz
    {
      id: 'cuscuz-1',
      name: 'Cuscuz Proteico com Frango',
      category: 'cuscuz',
      prepTime: 20,
      portion: '1 porção',
      macros: { protein: 30, carbs: 45, fat: 6, kcal: 354 },
      ingredients: ['cuscuz', 'frango em cubos', 'cebola', 'tomate', 'castanhas'],
      instructions: 'Cozinhar cuscuz, refogar frango com legumes, misturar'
    },
    {
      id: 'cuscuz-2',
      name: 'Cuscuz Proteico com Ovo',
      category: 'cuscuz',
      prepTime: 15,
      portion: '1 porção',
      macros: { protein: 28, carbs: 45, fat: 8, kcal: 364 },
      ingredients: ['cuscuz', 'ovos', 'cebola', 'tomate'],
      instructions: 'Cozinhar cuscuz, fazer ovos mexidos, misturar'
    },
    {
      id: 'cuscuz-3',
      name: 'Cuscuz Proteico com Carne',
      category: 'cuscuz',
      prepTime: 25,
      portion: '1 porção',
      macros: { protein: 32, carbs: 45, fat: 10, kcal: 398 },
      ingredients: ['cuscuz', 'carne moída', 'cebola', 'tomate', 'castanhas'],
      instructions: 'Cozinhar cuscuz, refogar carne moída, misturar'
    },
    // Frango
    {
      id: 'frango-1',
      name: 'Frango em Cubos',
      category: 'frango',
      prepTime: 30,
      portion: '4 porções',
      macros: { protein: 35, carbs: 2, fat: 5, kcal: 188 },
      ingredients: ['peito de frango', 'cebola', 'alho', 'temperos'],
      instructions: 'Cortar frango em cubos, temperar, grelhar ou assar'
    },
    {
      id: 'frango-2',
      name: 'Frango Desfiado',
      category: 'frango',
      prepTime: 40,
      portion: '4 porções',
      macros: { protein: 35, carbs: 2, fat: 5, kcal: 188 },
      ingredients: ['peito de frango', 'cebola', 'alho'],
      instructions: 'Cozinhar frango, desfiar, temperar'
    },
    {
      id: 'frango-3',
      name: 'Frango Empanado com Aveia',
      category: 'frango',
      prepTime: 35,
      portion: '4 porções',
      macros: { protein: 32, carbs: 15, fat: 8, kcal: 260 },
      ingredients: ['peito de frango', 'aveia', 'ovos', 'temperos'],
      instructions: 'Passar frango no ovo, empanar com aveia, assar na airfryer por 20min a 200°C'
    },
    {
      id: 'frango-4',
      name: 'Sobrecoxa de Frango',
      category: 'frango',
      prepTime: 40,
      portion: '4 porções',
      macros: { protein: 30, carbs: 2, fat: 12, kcal: 226 },
      ingredients: ['sobrecoxa de frango', 'temperos'],
      instructions: 'Temperar sobrecoxa, assar por 35min a 200°C'
    },
    // Carne
    {
      id: 'carne-1',
      name: 'Carne Moída Refogada',
      category: 'carne',
      prepTime: 25,
      portion: '4 porções',
      macros: { protein: 28, carbs: 3, fat: 15, kcal: 271 },
      ingredients: ['carne moída', 'cebola', 'tomate', 'alho'],
      instructions: 'Refogar carne moída com legumes e temperos'
    },
    {
      id: 'carne-2',
      name: 'Carne Moída com Legumes',
      category: 'carne',
      prepTime: 30,
      portion: '4 porções',
      macros: { protein: 28, carbs: 8, fat: 15, kcal: 291 },
      ingredients: ['carne moída', 'cebola', 'tomate', 'cenoura', 'beterraba'],
      instructions: 'Refogar carne com legumes cortados'
    },
    {
      id: 'carne-3',
      name: 'Carne Moída com Feijão',
      category: 'carne',
      prepTime: 35,
      portion: '4 porções',
      macros: { protein: 30, carbs: 25, fat: 15, kcal: 349 },
      ingredients: ['carne moída', 'feijão cozido', 'cebola', 'tomate'],
      instructions: 'Refogar carne, adicionar feijão, cozinhar junto'
    },
    // Outros
    {
      id: 'omelete',
      name: 'Omelete de Forno / Muffins Proteicos',
      category: 'outros',
      prepTime: 30,
      portion: '6 unidades',
      macros: { protein: 20, carbs: 3, fat: 12, kcal: 200 },
      ingredients: ['ovos', 'frango desfiado', 'cebola', 'tomate', 'temperos'],
      instructions: 'Bater ovos, misturar ingredientes, colocar em forminhas, assar por 20min a 180°C'
    },
    {
      id: 'almondegas',
      name: 'Almôndegas na Airfryer',
      category: 'outros',
      prepTime: 25,
      portion: '4 porções',
      macros: { protein: 28, carbs: 5, fat: 10, kcal: 222 },
      ingredients: ['carne moída', 'aveia', 'cebola', 'alho', 'temperos'],
      instructions: 'Misturar ingredientes, formar bolinhas, assar na airfryer por 15min a 200°C'
    }
  ];
}

