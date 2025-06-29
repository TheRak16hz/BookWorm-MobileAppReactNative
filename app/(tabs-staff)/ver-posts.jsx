import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import styles from "../../assets/styles/verPost.styles";

export default function VerPosts() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al obtener posts");
      setPosts(data);
    } catch (error) {
      console.error("Error al cargar posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Todos los Posts</Text>

      {posts.length === 0 ? (
        <Text style={styles.noPostsText}>No hay posts disponibles.</Text>
      ) : (
        posts.map((post) => (
          <View key={post._id} style={styles.card}>
            <Image source={{ uri: post.image }} style={styles.image} />
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
