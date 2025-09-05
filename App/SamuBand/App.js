import React, { useState, useEffect } from 'react'; 
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

// Tela de Login
function LoginScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (!nome || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    fetch('https://myband.up.railway.app/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.banda_id) {
          AsyncStorage.setItem('userToken', data.banda_id.toString());
          Alert.alert('Sucesso', 'Login bem-sucedido!');
          navigation.replace('Setlist', { banda_id: data.banda_id, nomeBanda: nome });
        } else {
          Alert.alert('Erro', 'Credenciais inválidas.');
        }
      })
      .catch(() => Alert.alert('Erro', 'Falha ao conectar com o servidor.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎶 MyBand</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da Banda"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <View style={{ marginBottom: 5, marginTop: 10 }}>
        <Button title="Entrar" onPress={handleLogin} color="#3f73f1" />
      </View>
      <View style={{ marginTop: 10 }}>
        <Button
          title="Registrar Banda"
          onPress={() => navigation.navigate('Register')}
          color="#3f73f1"
        />
      </View>
    </View>
  );
}

// Tela de Registro
function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = () => {
    if (!nome || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    fetch('https://myband.up.railway.app/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha }),
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert('Sucesso', data.message);
        navigation.goBack();
      })
      .catch(() => Alert.alert('Erro', 'Falha ao conectar com o servidor.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎶 MyBand</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da Banda"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
       <View style={{ marginBottom: 5, marginTop: 10 }}>
      <Button title="Registrar Banda" onPress={handleRegister} color="#3f73f1" />
      </View>
      <View style={{ marginTop: 10 }}>
      <Button
        style={{marginTop: 10}}
        title="Já tem conta? Faça login"
        onPress={() => navigation.navigate('Login')}
        color="#3f73f1"
      />
      </View>
    </View>
  );
}

// Tela de Setlist
function SetlistScreen({ route, navigation }) {
  const { banda_id, nomeBanda } = route.params || {};
  const [musica, setMusica] = useState('');
  const [link, setLink] = useState('');
  const [setlist, setSetlist] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    if (banda_id) {
      fetch(`https://myband.up.railway.app/setlist/${banda_id}`)
        .then(res => res.json())
        .then(data => {
          setSetlist(data);
        })
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar a setlist.'));
    }
  }, [banda_id]);

  const adicionarOuAtualizarMusica = () => {
    if (!musica.trim()) {
      Alert.alert('Erro', 'Informe o nome da música.');
      return;
    }
  
    const payload = {
      nome_musica: musica,
      link: link || '',
      ...(editandoId ? {} : { banda_id }),
    };
  
    if (editandoId) {
      fetch(`https://myband.up.railway.app/setlist/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(() => {
          setSetlist(prev =>
            prev.map(m =>
              m.id === editandoId ? { ...m, nome_musica: musica, link } : m
            )
          );
          setEditandoId(null);
          setMusica('');
          setLink('');
          // Força o reload da lista de músicas após atualização
          carregarSetlist(); 
        })
        .catch(() => Alert.alert('Erro', 'Erro ao atualizar música.'));
    } else {
      fetch('https://myband.up.railway.app/setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(() => {
          setMusica('');
          setLink('');
          // Força o reload da lista de músicas após adicionar
          carregarSetlist(); 
        })
        .catch(() => Alert.alert('Erro', 'Erro ao adicionar música.'));
    }
  };
  
  // Função para recarregar a lista de músicas
  const carregarSetlist = () => {
    if (banda_id) {
      fetch(`https://myband.up.railway.app/setlist/${banda_id}`)
        .then(res => res.json())
        .then(data => {
          setSetlist(data);
        })
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar a setlist.'));
    }
  };

  const editarMusica = (id, nome, link) => {
    setMusica(nome);
    setLink(link);
    setEditandoId(id);
  };

  const removerMusica = (id) => {
    fetch(`https://myband.up.railway.app/setlist/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setSetlist(prev => prev.filter(m => m.id !== id));
      })
      .catch(() => Alert.alert('Erro', 'Erro ao excluir música.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repertório da Banda: {nomeBanda}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Música"
        value={musica}
        onChangeText={setMusica}
      />
      <TextInput
        style={styles.input}
        placeholder="Link da Música (opcional)"
        value={link}
        onChangeText={setLink}
      />

      <Button
        title={editandoId ? 'Atualizar Música' : 'Adicionar Música'}
        onPress={adicionarOuAtualizarMusica}
        color="#3f73f1"
      />

      <FlatList
        style={{ marginTop: 20 }}
        data={setlist}
        keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.item}>{item.nome_musica}</Text>
              {item.link ? (
                <Text style={{ color: '#3f73f1', fontSize: 16 }}>{item.link}</Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => editarMusica(item.id, item.nome_musica, item.link)}>
                <Text style={styles.link}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removerMusica(item.id)}>
                <Text style={[styles.link, { color: 'red' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Button title="Voltar" onPress={() => navigation.navigate('Login')} color="gray" />
    </View>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!userToken);
      } catch (e) {
        console.error('Erro ao verificar o status do login:', e);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Setlist' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrar Banda' }} />
        <Stack.Screen name="Setlist" component={SetlistScreen} options={{ title: 'Setlist' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  item: {
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  link: {
    fontSize: 16,
    color: '#3f73f1',
  },
});
