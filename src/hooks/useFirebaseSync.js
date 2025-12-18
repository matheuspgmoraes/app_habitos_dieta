import { useState, useEffect, useRef } from 'react';
import { database, auth } from '../config/firebase';
import { ref, set, onValue, off, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

export function useFirebaseSync(userId, data, updateData) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const syncRef = useRef(false);
  const listenerRef = useRef(null);

  // Autenticar anonimamente
  useEffect(() => {
    if (!auth || !database) {
      setError('Firebase não configurado. Configure as credenciais em src/config/firebase.js');
      return;
    }

    signInAnonymously(auth)
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        console.error('Erro na autenticação:', err);
        setError('Erro ao conectar com Firebase: ' + err.message);
        setIsConnected(false);
      });
  }, []);

  // Sincronizar dados para o Firebase
  const syncToFirebase = async () => {
    if (!database || !userId || !isConnected) {
      setError('Não conectado ao Firebase');
      return false;
    }

    try {
      setIsSyncing(true);
      const dataRef = ref(database, `users/${userId}/data`);
      await set(dataRef, {
        ...data,
        lastUpdated: Date.now()
      });
      setLastSync(new Date());
      setError(null);
      setIsSyncing(false);
      return true;
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      setError('Erro ao sincronizar: ' + err.message);
      setIsSyncing(false);
      return false;
    }
  };

  // Sincronizar dados do Firebase
  const syncFromFirebase = async () => {
    if (!database || !userId || !isConnected) {
      setError('Não conectado ao Firebase');
      return false;
    }

    try {
      setIsSyncing(true);
      const dataRef = ref(database, `users/${userId}/data`);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        const remoteData = snapshot.val();
        // Comparar timestamps para decidir qual versão usar
        const localTimestamp = data?.lastUpdated || 0;
        const remoteTimestamp = remoteData?.lastUpdated || 0;
        
        if (remoteTimestamp > localTimestamp) {
          // Dados remotos são mais recentes
          delete remoteData.lastUpdated;
          updateData(remoteData);
          setLastSync(new Date());
          setError(null);
          setIsSyncing(false);
          return true;
        } else {
          // Dados locais são mais recentes, enviar para o Firebase
          await syncToFirebase();
          return true;
        }
      } else {
        // Não há dados remotos, enviar dados locais
        await syncToFirebase();
        return true;
      }
    } catch (err) {
      console.error('Erro ao sincronizar do Firebase:', err);
      setError('Erro ao sincronizar: ' + err.message);
      setIsSyncing(false);
      return false;
    }
  };

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!database || !userId || !isConnected || syncRef.current) return;

    syncRef.current = true;
    const dataRef = ref(database, `users/${userId}/data`);
    
    listenerRef.current = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.val();
        const localTimestamp = data?.lastUpdated || 0;
        const remoteTimestamp = remoteData?.lastUpdated || 0;
        
        // Só atualizar se os dados remotos forem mais recentes e não vierem desta instância
        if (remoteTimestamp > localTimestamp && !isSyncing) {
          delete remoteData.lastUpdated;
          updateData(remoteData);
          setLastSync(new Date());
        }
      }
    }, (error) => {
      console.error('Erro ao escutar mudanças:', error);
      setError('Erro ao escutar mudanças: ' + error.message);
    });

    return () => {
      if (listenerRef.current) {
        off(dataRef, 'value', listenerRef.current);
        listenerRef.current = null;
      }
      syncRef.current = false;
    };
  }, [database, userId, isConnected, data, updateData, isSyncing]);

  // Sincronizar automaticamente quando os dados mudarem localmente
  useEffect(() => {
    if (!isConnected || !userId || syncRef.current) return;
    
    const timer = setTimeout(() => {
      syncToFirebase();
    }, 2000); // Aguardar 2 segundos após a última mudança

    return () => clearTimeout(timer);
  }, [data, isConnected, userId]);

  return {
    isConnected,
    isSyncing,
    lastSync,
    error,
    syncToFirebase,
    syncFromFirebase
  };
}

