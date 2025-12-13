# Como Usar o App Offline

## 📱 Instalação como PWA

### Passo 1: Build do Projeto
```bash
npm run build
```

### Passo 2: Servir o Build Localmente

**Opção A - Usando Vite Preview:**
```bash
npm run preview
```

**Opção B - Usando um servidor HTTP simples:**
```bash
# Instalar servidor global
npm install -g http-server

# Na pasta do projeto, após o build
cd dist
http-server -p 8080
```

**Opção C - Usando Python (se tiver instalado):**
```bash
cd dist
python -m http.server 8080
```

### Passo 3: Acessar e Instalar

1. Abra o navegador no celular/PC
2. Acesse: `http://SEU_IP:8080` (ou a porta que você escolheu)
3. Instale como PWA:
   - **Android (Chrome)**: Menu → "Adicionar à tela inicial"
   - **iPhone (Safari)**: Compartilhar → "Adicionar à Tela de Início"
   - **Desktop**: Clique no ícone de instalação na barra de endereços

## ✅ Funcionalidades Offline

Após a primeira carga, o app funciona **100% offline**:
- ✅ Dashboard
- ✅ Planner
- ✅ Checklist
- ✅ Receitas
- ✅ Lista de Compras
- ✅ Preparo da Semana
- ✅ Histórico

Todos os dados são salvos no **LocalStorage** do navegador.

## 🔄 Atualizações

Quando você fizer mudanças no código:
1. Execute `npm run build` novamente
2. O Service Worker atualizará automaticamente quando você acessar o app
3. Ou limpe o cache do navegador se necessário

## 🌐 Hospedar Online (Opcional)

Para acesso de qualquer lugar:

**Netlify (Grátis):**
```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```

**Vercel (Grátis):**
```bash
npm install -g vercel
vercel --prod
```

**GitHub Pages:**
- Faça push do código
- Configure GitHub Pages para servir a pasta `dist`

