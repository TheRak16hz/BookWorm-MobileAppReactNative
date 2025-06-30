import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import styles from '../../assets/styles/etapasPosts.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function EtapasScreen() {
  const { token, user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    etapa: 'etapa 1',
    fecha_inicio: '',
    fecha_fin: '',
    jurado: []
  });

  const [profesores, setProfesores] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  useEffect(() => {
    fetchProfesores();
    fetchEtapas();
  }, []);

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

  const formatDate = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const validateDate = (dateStr) => /^\d{2}-\d{2}-\d{4}$/.test(dateStr);

  const showDatePickerInicio = () => {
    DateTimePickerAndroid.open({
      value: selectedStartDate,
      mode: 'date',
      is24Hour: true,
      display: 'calendar',
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          setSelectedStartDate(date);
          setForm(prev => ({ ...prev, fecha_inicio: formatDate(date) }));
        }
      }
    });
  };

  const showDatePickerFin = () => {
    DateTimePickerAndroid.open({
      value: selectedEndDate,
      mode: 'date',
      is24Hour: true,
      display: 'calendar',
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          setSelectedEndDate(date);
          setForm(prev => ({ ...prev, fecha_fin: formatDate(date) }));
        }
      }
    });
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

  const handleCreate = async () => {
    const { fecha_inicio, fecha_fin, jurado } = form;

    if (!fecha_inicio || !fecha_fin || jurado.length === 0) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!validateDate(fecha_inicio) || !validateDate(fecha_fin)) {
      Alert.alert('Error', 'Las fechas deben tener el formato DD-MM-YYYY');
      return;
    }

    const fechaInicio = parseDate(fecha_inicio);
    const fechaFin = parseDate(fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy || fechaFin < hoy) {
      Alert.alert('Error', 'Las fechas deben ser posteriores a la fecha actual');
      return;
    }

    if (fechaFin < fechaInicio) {
      Alert.alert('Error', 'La fecha de fin no puede ser menor que la de inicio');
      return;
    }

    try {
      const body = {
        etapa: form.etapa,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        jurado
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
        let message = 'Respuesta inesperada del servidor';

        try {
          const json = JSON.parse(text);
          if (json.message === 'La etapa ya existe') {
            message = `La "${form.etapa}" ya existe`;
          } else if (json.message) {
            message = json.message;
          }
        } catch (parseErr) {
          console.error('Error al analizar respuesta:', parseErr);
        }

        Alert.alert('Error', message);
      }
    } catch (err) {
      console.error('Error al guardar etapa:', err);
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
      {isAdmin && (
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

          {/* Fecha inicio */}
          <TouchableOpacity onPress={showDatePickerInicio}>
            <TextInput
              placeholder="Seleccionar fecha inicio"
              value={form.fecha_inicio}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            />
          </TouchableOpacity>

          {/* Fecha fin */}
          <TouchableOpacity onPress={showDatePickerFin}>
            <TextInput
              placeholder="Seleccionar fecha fin"
              value={form.fecha_fin}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            />
          </TouchableOpacity>

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
              <Text style={{
                color: form.jurado.includes(prof._id) ? COLORS.white : COLORS.textPrimary
              }}>
                {prof.nombre} {prof.apellido}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.primary, marginTop: 20 }]}
            onPress={handleCreate}
          >
            <Ionicons name="add-outline" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Guardar etapa</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subtitle}>ETAPAS CREADAS</Text>
      {etapas.length === 0 ? (
        <Text style={styles.emptyText}>No hay etapas registradas.</Text>
      ) : (
        etapas.map(etapa => (
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

              {isAdmin && (
                <TouchableOpacity
                  onPress={() => handleDelete(etapa.etapa)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error || 'red'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
