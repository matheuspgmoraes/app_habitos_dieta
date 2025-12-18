// Configuração do Firebase
// IMPORTANTE: Substitua estas configurações pelas suas próprias do Firebase Console
// Para obter essas configurações:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou selecione um existente
// 3. Vá em Project Settings > General > Your apps
// 4. Adicione uma Web app e copie as configurações

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase (substitua pelos seus valores)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializar Firebase apenas se as configurações estiverem definidas
let app = null;
let database = null;
let auth = null;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
  }
}

export { app, database, auth };

