import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from '../../assets/styles/verPost.styles.js';
import { API_URL } from '../../constants/api';
import COLORS from '../../constants/colors';

export default function Create() {
  const { token } = useAuthStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const res = await fetch(`${API_URL}/posts?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener posts');

      const newPosts = data.posts;
      setPosts(refresh || pageNum === 1 ? newPosts : [...posts, ...newPosts]);
      setPage(pageNum);
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error('Error cargando posts:', err);
    } finally {
      if (refresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchPosts(page + 1);
    }
  };

  const onRefresh = () => {
    fetchPosts(1, true);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.container}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListFooterComponent={
        hasMore ? (
          <ActivityIndicator
            style={{ margin: 16 }}
            size="small"
            color={COLORS.primary}
          />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay posts disponibles.</Text>
        </View>
      }
    />
  );
}
