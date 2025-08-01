import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from "../../assets/styles/login.styles";
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import COLORS from '../../constants/colors';
import { Link } from "expo-router";
import { useAuthStore } from '../../store/authStore.js';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login, isCheckingAuth } = useAuthStore();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert("Error", result.error);
    }
  };

  if (isCheckingAuth) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Illustration */}
        <View style={styles.topIllustration}>
          <Image
            source={require("../../assets/images/login.png")}
            style={[styles.illustrationImage, {
            height: 250, // Reducido un poco más, puedes ajustarlo
            width: '80%', // Puedes usar un porcentaje para el ancho, o un valor fijo
            marginBottom: 30,
            marginTop: -20 // Aquí agregamos el margen inferior
          },]}  // <== reducimos el tamaño
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.inputIcon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* login button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* footer links */}
            <View style={[styles.footer, { marginTop: 20 }]}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={[styles.footer, { marginTop: 10, marginBottom: 20 }]}>
              <Text style={styles.footerText}>Are you staff?</Text>
              <Link href="/staff-login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Login as staff</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
