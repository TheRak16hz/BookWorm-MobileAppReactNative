import { View, Text, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import styles from '../../assets/styles/profile.styles';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import COLORS from '../../constants/colors';

export default function StaffProfile() {
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { token, user } = useAuthStore();

  const fetchStaffData = async () => {
    try {
      setIsLoading(true);

      /*if (!user?.cedula) {
        throw new Error("No se encontró la cédula del usuario logueado");
      }*/

      const url = `${API_URL}/staff/cedula/${user.cedula}`;
      console.log("Fetching staff data from:", url);

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
      setStaff(data);

    } catch (error) {
      console.error("Error fetching staff data:", error);
      Alert.alert("Error", error.message || "No se pudo cargar la información del perfil");
      setStaff(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStaffData();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!staff) {
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
        <Text style={styles.errorText}>No se encontró información del personal</Text>
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
        <Text style={styles.infoTitle}>Información del Personal</Text>

        <Text style={styles.infoLabel}>Nombre:</Text>
        <Text style={styles.infoValue}>{staff.nombre} {staff.apellido}</Text>

        <Text style={styles.infoLabel}>Cédula:</Text>
        <Text style={styles.infoValue}>{staff.cedula}</Text>

        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{staff.correo}</Text>

        <Text style={styles.infoLabel}>Rol:</Text>
        <Text style={styles.infoValue}>{staff.role}</Text>

        <Text style={styles.infoLabel}>Activo:</Text>
        <Text style={styles.infoValue}>{staff.status ? "Sí" : "No"}</Text>
      </View>
    </ScrollView>
  );
}
