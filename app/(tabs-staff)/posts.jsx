import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import styles from "../../assets/styles/createPosts.styles";
import COLORS from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from "../../constants/api.js";

export default function PostsScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ← NUEVO

  const router = useRouter();
  const { token } = useAuthStore();

  const allowedTypes = ["jpeg", "jpg", "png", "webp"];

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a tu galería.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled) {
        const selected = result.assets[0];
        const uri = selected.uri;
        const fileType = uri.split('.').pop().toLowerCase();

        console.log("Tipo de archivo seleccionado:", fileType);

        if (!allowedTypes.includes(fileType)) {
          Alert.alert("Formato inválido", "Solo se admiten imágenes JPEG, JPG, PNG o WEBP");
          return;
        }

        setImage(uri);

        if (selected.base64) {
          setImageBase64(selected.base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar la imagen");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !imageBase64 || !image) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const fileType = image.split('.').pop().toLowerCase();
      const imageType = allowedTypes.includes(fileType) ? `image/${fileType}` : 'image/jpeg';
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      console.log("Enviando imagen con tipo:", imageType);

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          image: imageDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ocurrió un error");

      Alert.alert("Éxito", "¡Post creado correctamente!");
      setTitle("");
      setDescription("");
      setImage(null);
      setImageBase64(null);
      router.push({ pathname: "/ver-posts", params: { refresh: 'true' } });

    } catch (error) {
      console.error("Error al crear post:", error);

      if (
        error.message.includes("PayloadTooLarge") ||
        error.message.includes("Already read") ||
        error.message.includes("Unexpected character")
      ) {
        setImage(null);
        setImageBase64(null);
        Alert.alert(
          "Error con la imagen",
          "Hubo un problema al subir la imagen. Intenta seleccionar otra más liviana o vuelve a intentarlo."
        );
      } else {
        Alert.alert("Error", error.message || "No se pudo crear el post");
      }

    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Función de refresco manual
  const onRefresh = () => {
    setRefreshing(true);
    setTitle("");
    setDescription("");
    setImage(null);
    setImageBase64(null);
    setTimeout(() => {
      setRefreshing(false);
    }, 500); // espera 0.5 seg
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
        refreshControl={ // ← NUEVO
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.title}>Crear una publicación</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe el título"
              placeholderTextColor={COLORS.placeholderText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Escribe la descripción..."
              placeholderTextColor={COLORS.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Imagen</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name='image-outline' size={40} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}>Toca para seleccionar una imagen</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Publicar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
