# 📱 Como Usar o App Offline - Guia Simples

## O que você precisa fazer:

### 1️⃣ Fazer o Build (criar versão para produção)
Abra o terminal na pasta do projeto e execute:
```bash
npm run build
```

Isso vai criar uma pasta chamada `dist` com todos os arquivos prontos.

### 2️⃣ Testar Localmente
Execute:
```bash
npm run preview
```

O app vai abrir em `http://localhost:4173` (ou outra porta que aparecer).

### 3️⃣ Instalar no Celular

**Opção A - Mesma rede WiFi:**
1. Descubra o IP do seu computador:
   - Windows: Abra PowerShell e digite `ipconfig | Select-String -Pattern "IPv4"`
   - Procure por algo como `192.168.x.x` ou `10.0.x.x`
2. No celular, acesse: `http://SEU_IP:4173` (substitua SEU_IP pelo IP encontrado)
3. Instale como PWA:
   - **Android**: Menu (3 pontos) → "Adicionar à tela inicial" ou "Instalar app"
   - **iPhone**: Compartilhar → "Adicionar à Tela de Início"

**Opção B - Servir a pasta dist:**
1. Copie a pasta `dist` para um servidor web
2. Ou use serviços grátis:
   - **Netlify**: Arraste a pasta `dist` para netlify.com
   - **Vercel**: Instale Vercel CLI e faça `vercel --prod`
   - **GitHub Pages**: Configure para servir a pasta `dist`

### 4️⃣ Pronto! 🎉

Depois de instalar, o app funciona **100% offline**:
- ✅ Todos os dados salvos no celular
- ✅ Funciona sem internet
- ✅ Atualiza automaticamente quando você acessa online

## ⚠️ Importante

- O app precisa ser acessado pelo menos uma vez online para instalar
- Depois disso, funciona offline para sempre
- Se você mudar o código, faça `npm run build` novamente

