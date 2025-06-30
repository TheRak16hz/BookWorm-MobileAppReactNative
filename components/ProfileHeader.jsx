import { View, Text } from 'react-native';
import React from 'react';
import { useAuthStore } from '../store/authStore';
import styles from '../assets/styles/profile.styles';
import { Image } from 'expo-image';
import { formatMemberSince } from '../lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileHeader() {
  const { user } = useAuthStore();

  if (!user) return null;

  // Detectar correo dependiendo del tipo
  const email = user.email || user.correo || "Sin correo";

  // Detectar rol
  const isStaff = user.role === "admin" || user.role === "profesor";
  const roleLabel = isStaff ? `Staff (${user.role})` : "Estudiante";

  // Imagen de perfil predeterminada
  const profileImage = user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Fecha formateada
  const joinedDate = user.createdAt ? formatMemberSince(user.createdAt) : "Desconocido";

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.cedula}</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.memberSince}>Miembro desde: {joinedDate}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </View>
    </View>
  );
}
