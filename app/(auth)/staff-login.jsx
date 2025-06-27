import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from "../../assets/styles/login.styles";
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import COLORS from '../../constants/colors';
import { router } from "expo-router";
import { useAuthStore } from '../../store/authStore.js';
import { Link } from "expo-router";

export default function StaffLogin() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, staffLogin, isCheckingAuth } = useAuthStore();

  const handleLogin = async () => {
    const result = await staffLogin(correo, password);
    if (!result.success) {
      Alert.alert("Error", result.error);
    }
  };

  if (isCheckingAuth) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.topIllustration}>
          <Image
            source={require("../../assets/images/ilustration1.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.placeholderText}
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.inputIcon} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="enter your password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login as Staff</Text>
              )}
            </TouchableOpacity>

            {/* link al login de estudiante */}
            <View style={styles.footer}>
            <Text style={styles.footerText}>Are you a student?</Text>
            <Link href="/login" asChild>
                <TouchableOpacity>
                <Text style={styles.link}>Login as student</Text>
                </TouchableOpacity>
            </Link>
            </View>
            
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
