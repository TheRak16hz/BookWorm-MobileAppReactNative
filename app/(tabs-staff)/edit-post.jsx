import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import styles from '../../assets/styles/createPosts.styles';
import COLORS from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';

export default function EditPostScreen() {
  const { token } = useAuthStore();
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTitle(data.title);
          setDescription(data.description);
        } else {
          Alert.alert('Error', data.message);
          router.back();
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'No se pudo obtener el post.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !description) {
      return Alert.alert('Campos incompletos', 'Añade título y descripción.');
    }
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Alert.alert('Éxito', 'Post actualizado.');
      router.replace('/staff/ver-posts');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo actualizar.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar Post</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.textArea}
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Botón guardar */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={20}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botón volver pegado justo debajo */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.textSecondary, marginTop: 8 }]}
          onPress={() => router.push('/ver-posts')}
        >
          <Ionicons
            name="arrow-back-outline"
            size={20}
            color={COLORS.white}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
