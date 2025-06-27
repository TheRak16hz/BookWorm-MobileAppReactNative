import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import styles from '../../assets/styles/etapasPosts.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';

export default function EtapasScreen() {
  const { token } = useAuthStore();
  const [etapas, setEtapas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    etapa: 'etapa 1',
    fecha_inicio: '',
    fecha_fin: '',
    jurado: []
  });

  const fetchEtapas = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_URL}/etapas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEtapas(data);
      } else {
        setEtapas([]);
      }
    } catch (err) {
      console.error('Error cargando etapas:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await fetch(`${API_URL}/profesores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfesores(data);
      }
    } catch (err) {
      console.error('Error cargando profesores:', err);
    }
  };

  useEffect(() => {
    fetchEtapas();
    fetchProfesores();
  }, []);

  const validateDate = (dateStr) => {
    return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
  };

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleCreate = async () => {
  if (!form.fecha_inicio || !form.fecha_fin || form.jurado.length === 0) {
    Alert.alert('Error', 'Completa todos los campos');
    return;
  }

  if (!validateDate(form.fecha_inicio) || !validateDate(form.fecha_fin)) {
    Alert.alert('Error', 'Las fechas deben tener el formato DD-MM-YYYY');
    return;
  }

  try {
    const body = {
      etapa: form.etapa,
      fecha_inicio: parseDate(form.fecha_inicio).toISOString(),
      fecha_fin: parseDate(form.fecha_fin).toISOString(),
      jurado: form.jurado
    };

    const res = await fetch(`${API_URL}/etapas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      Alert.alert('Éxito', 'Etapa guardada');
      setForm({
        etapa: 'etapa 1',
        fecha_inicio: '',
        fecha_fin: '',
        jurado: []
      });
      fetchEtapas();
    } else {
      const text = await res.text();
      console.log('Respuesta cruda del servidor:', text);

      let message = 'Respuesta inesperada del servidor';

      try {
        const json = JSON.parse(text);
        if (json.message === 'La etapa ya existe') {
          message = `La "${form.etapa}" ya existe`;
        } else if (json.message) {
          message = json.message;
        }
      } catch (parseErr) {
        console.error('Error al analizar la respuesta:', parseErr);
      }

      Alert.alert('Error', message);
    }
  } catch (err) {
    console.error('Error guardando etapa:', err);
    Alert.alert('Error', 'Error interno');
  }
};

  const handleDelete = async (etapaName) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar ${etapaName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/etapas/${etapaName}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                Alert.alert('Eliminada', 'Etapa eliminada correctamente');
                fetchEtapas();
              } else {
                Alert.alert('Error', 'No se pudo eliminar');
              }
            } catch (err) {
              console.error('Error eliminando etapa:', err);
              Alert.alert('Error', 'Error interno');
            }
          }
        }
      ]
    );
  };

  const toggleJurado = (profId) => {
    setForm(prev => {
      const current = [...prev.jurado];
      if (current.includes(profId)) {
        return { ...prev, jurado: current.filter(id => id !== profId) };
      } else if (current.length < 3) {
        return { ...prev, jurado: [...current, profId] };
      } else {
        Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 3 jurados');
        return prev;
      }
    });
  };

  const getNombresJurado = (juradoIds) => {
    return juradoIds
      .map(id => {
        const prof = profesores.find(p => p._id === id);
        return prof ? `${prof.nombre} ${prof.apellido}` : id;
      })
      .join(', ');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
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
      <View style={styles.card}>
        <Text style={styles.title}>CREAR / ACTUALIZAR ETAPA</Text>

        <Picker
          selectedValue={form.etapa}
          onValueChange={(itemValue) =>
            setForm(prev => ({ ...prev, etapa: itemValue }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Etapa 1" value="etapa 1" />
          <Picker.Item label="Etapa 2" value="etapa 2" />
          <Picker.Item label="Etapa 3" value="etapa 3" />
        </Picker>

        <TextInput
          placeholder="Fecha inicio (DD-MM-YYYY)"
          style={styles.input}
          value={form.fecha_inicio}
          onChangeText={text => setForm(prev => ({ ...prev, fecha_inicio: text }))}
        />

        <TextInput
          placeholder="Fecha fin (DD-MM-YYYY)"
          style={styles.input}
          value={form.fecha_fin}
          onChangeText={text => setForm(prev => ({ ...prev, fecha_fin: text }))}
        />

        <Text style={styles.label}>Selecciona jurado (máx. 3):</Text>
        {profesores.map(prof => (
          <TouchableOpacity
            key={prof._id}
            style={[
              styles.juradoItem,
              form.jurado.includes(prof._id) && styles.juradoItemSelected
            ]}
            onPress={() => toggleJurado(prof._id)}
          >
            <Text style={{ color: form.jurado.includes(prof._id) ? COLORS.white : COLORS.textPrimary }}>
              {prof.nombre} {prof.apellido}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          onPress={handleCreate}
        >
          <Ionicons name="add-outline" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Guardar etapa</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>ETAPAS CREADAS</Text>
      {etapas.length === 0 && (
        <Text style={styles.emptyText}>No hay etapas registradas.</Text>
      )}
      {etapas.map(etapa => (
        <View key={etapa._id} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Etapa:</Text>
              <Text style={styles.value}>{etapa.etapa}</Text>

              <Text style={styles.label}>Fecha inicio:</Text>
              <Text style={styles.value}>{new Date(etapa.fecha_inicio).toLocaleDateString()}</Text>

              <Text style={styles.label}>Fecha fin:</Text>
              <Text style={styles.value}>{new Date(etapa.fecha_fin).toLocaleDateString()}</Text>

              <Text style={styles.label}>Jurado:</Text>
              <Text style={styles.value}>{getNombresJurado(etapa.jurado)}</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleDelete(etapa.etapa)}
              style={{ padding: 4 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error || 'red'} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
