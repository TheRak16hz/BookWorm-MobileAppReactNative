import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import styles from '../../assets/styles/home.styles';
import COLORS from '../../constants/colors';

export default function Home() {
  const { token } = useAuthStore();
  const [etapas, setEtapas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEtapas = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_URL}/etapas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEtapas(data);
    } catch (err) {
      console.error('Error cargando etapas:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await fetch(`${API_URL}/profesores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfesores(data);
    } catch (err) {
      console.error('Error cargando profesores:', err);
    }
  };

  const getNombresJurado = (juradoIds) => {
    return juradoIds
      .map((id) => {
        const prof = profesores.find((p) => p._id === id);
        return prof ? `${prof.nombre} ${prof.apellido}` : id;
      })
      .join(', ');
  };

  useEffect(() => {
    fetchEtapas();
    fetchProfesores();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchEtapas();
            fetchProfesores();
          }}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Etapas de Evaluación</Text>
        <Text style={styles.headerSubtitle}>Dpto. de Informática</Text>
      </View>

      {etapas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay etapas registradas.</Text>
        </View>
      ) : (
        etapas.map((etapa) => (
          <View key={etapa._id} style={styles.bookCard}>
            <Text style={styles.bookTitle}>{etapa.etapa}</Text>

            <Text style={styles.caption}>
              Fecha inicio:{' '}
              <Text style={{ fontWeight: '500' }}>
                {new Date(etapa.fecha_inicio).toLocaleDateString()}
              </Text>
            </Text>

            <Text style={styles.caption}>
              Fecha fin:{' '}
              <Text style={{ fontWeight: '500' }}>
                {new Date(etapa.fecha_fin).toLocaleDateString()}
              </Text>
            </Text>

            <Text style={styles.caption}>
              Jurado:{' '}
              <Text style={{ fontWeight: '500' }}>
                {getNombresJurado(etapa.jurado)}
              </Text>
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
