# Planner Profissional de Dieta, Treinos e Rotina (PWA)

Aplicativo PWA pessoal para planejamento de dieta, treinos e rotina. Funciona offline, sem backend, usando apenas LocalStorage.

## 🚀 Funcionalidades

- ✅ **Dashboard** - Progresso diário e semanal, treino do dia, resumo de refeições
- 📅 **Planner Diário** - Planejamento de refeições com horários fixos
- ✅ **Checklist** - Acompanhamento diário com porcentagens e histórico
- 🍽️ **Receitas** - Receitas com macros detalhados (proteína, carbo, gordura, kcal)
- 🛒 **Lista de Compras** - Lista automática com categorias e checkboxes
- 👨‍🍳 **Preparo da Semana** - Guia de preparo para domingo e quarta
- 📊 **Histórico** - Acompanhamento semanal com gráficos

## 🛠️ Tecnologias

- React 19
- Vite
- TailwindCSS
- PWA (vite-plugin-pwa)
- LocalStorage

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📱 Instalar como PWA

1. Faça o build do projeto: `npm run build`
2. Gere os ícones PNG (veja abaixo)
3. Acesse o app no navegador
4. No mobile: Menu → "Adicionar à tela inicial"
5. No desktop: Clique no ícone de instalação na barra de endereços

## 🎨 Gerar Ícones

Os ícones SVG já estão criados em `public/`. Para gerar os PNGs:

**Opção 1 - Online:**
- Use https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
- Faça upload dos SVGs e gere os PNGs

**Opção 2 - Sharp CLI:**
```bash
npm install -g sharp-cli
sharp -i public/icon-192.svg -o public/icon-192.png
sharp -i public/icon-512.svg -o public/icon-512.png
```

**Opção 3 - ImageMagick:**
```bash
convert public/icon-192.svg public/icon-192.png
convert public/icon-512.svg public/icon-512.png
```

## 📋 Estrutura do Projeto

```
src/
├── components/       # Componentes React
│   ├── Dashboard.jsx
│   ├── Planner.jsx
│   ├── Checklist.jsx
│   ├── Recipes.jsx
│   ├── ShoppingList.jsx
│   ├── WeeklyPrep.jsx
│   └── Navigation.jsx
├── hooks/           # Custom hooks
│   └── useStorage.js
├── utils/           # Utilitários
│   ├── storage.js
│   └── calculations.js
├── App.jsx          # Componente principal
└── main.jsx         # Entry point
```

## 🎯 Horários Fixos

- 07:00 - Café da manhã
- 09:00 - Lanche da manhã
- 12:30 - Almoço
- 15:30 - Lanche da tarde
- 18:00/18:30 - Jantar (18h em dias de vôlei)
- 22:00 - Pós-treino (somente dias de vôlei)

## 💪 Treinos

- **Academia**: Terça (16h), Quinta (17h), Sexta (16h), Sábado (livre)
- **Vôlei**: Segunda e Quarta (20h)

## 📝 Notas

- Dados salvos em LocalStorage (sem backend)
- Funciona offline após primeira carga
- Mobile-first design
- Sem login necessário

## 📄 Licença

Uso pessoal
