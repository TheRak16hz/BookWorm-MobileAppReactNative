import { View, Text, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import styles from '../../assets/styles/profile.styles';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import COLORS from '../../constants/colors';

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { token, user } = useAuthStore();

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);

      /*
      if (!user?.cedula) {
        throw new Error("No se encontró la cédula del usuario logueado");
      }*/

      const url = `${API_URL}/students/cedula/${user.cedula}`;
      console.log("Fetching student data from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const text = await response.text();
      console.log("Response text:", text);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      setStudent(data);

    } catch (error) {
      console.error("Error fetching student data:", error);
      Alert.alert("Error", error.message || "No se pudo cargar la información del perfil");
      setStudent(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudentData();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <ProfileHeader />
        <LogoutButton />
        <Text style={styles.errorText}>No se encontró información del estudiante</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información del Estudiante</Text>

        <Text style={styles.infoLabel}>Nombre:</Text>
        <Text style={styles.infoValue}>{student.nombre} {student.apellido}</Text>

        <Text style={styles.infoLabel}>Cédula:</Text>
        <Text style={styles.infoValue}>{student.cedula}</Text>

        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{student.email}</Text>


        <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
        <Text style={styles.infoValue}>{new Date(student.fecha_nacimiento).toLocaleDateString()}</Text>

        <Text style={styles.infoLabel}>Número de teléfono:</Text>
        <Text style={styles.infoValue}>{student.numero_telefono}</Text>

        <Text style={styles.infoLabel}>Dirección:</Text>
        <Text style={styles.infoValue}>{student.direccion}</Text>

        <Text style={styles.infoLabel}>Sexo:</Text>
        <Text style={styles.infoValue}>{student.sexo}</Text>

        <Text style={styles.infoLabel}>Status:</Text>
        <Text style={styles.infoValue}>{student.status ? "Activo" : "Inactivo"}</Text>
      </View>
    </ScrollView>
  );
}
