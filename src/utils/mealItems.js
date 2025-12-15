// Itens individuais que podem ser selecionados separadamente
export const individualItems = {
  carbos: [
    { id: 'arroz', name: 'Arroz', icon: '🍚' },
    { id: 'feijao', name: 'Feijão', icon: '🫘' },
    { id: 'cuscuz', name: 'Cuscuz', icon: '🌾' },
    { id: 'pao-integral', name: 'Pão Integral', icon: '🍞' }
  ],
  proteinas: [
    { id: 'frango-cubos', name: 'Frango em Cubos', icon: '🍗' },
    { id: 'frango-desfiado', name: 'Frango Desfiado', icon: '🍗' },
    { id: 'frango-empanado', name: 'Frango Empanado', icon: '🍗' },
    { id: 'sobrecoxa', name: 'Sobrecoxa', icon: '🍗' },
    { id: 'carne-moida', name: 'Carne Moída', icon: '🥩' },
    { id: 'ovos', name: 'Ovos', icon: '🥚' }
  ],
  saladas: [
    { id: 'alface', name: 'Alface', icon: '🥬' },
    { id: 'tomate', name: 'Tomate', icon: '🍅' },
    { id: 'cebola', name: 'Cebola', icon: '🧅' },
    { id: 'cenoura', name: 'Cenoura', icon: '🥕' },
    { id: 'beterraba', name: 'Beterraba', icon: '🍠' },
    { id: 'repolho', name: 'Repolho', icon: '🥬' }
  ],
  frutas: [
    { id: 'maca', name: 'Maçã', icon: '🍎' },
    { id: 'uva', name: 'Uva', icon: '🍇' },
    { id: 'morango', name: 'Morango', icon: '🍓' },
    { id: 'manga', name: 'Manga', icon: '🥭' },
    { id: 'mamao', name: 'Mamão', icon: '🍈' }
  ],
  outros: [
    { id: 'whey', name: 'Whey Protein', icon: '🥤' },
    { id: 'castanhas', name: 'Castanhas', icon: '🥜' },
    { id: 'nozes', name: 'Nozes', icon: '🌰' }
  ]
};

// Função para obter todos os itens em uma lista plana
export function getAllIndividualItems() {
  return Object.values(individualItems).flat();
}

// Função para obter item por ID
export function getItemById(id) {
  return getAllIndividualItems().find(item => item.id === id);
}



