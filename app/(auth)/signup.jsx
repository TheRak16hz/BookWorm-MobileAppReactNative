import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import styles from "../../assets/styles/signup.styles";
import { Ionicons } from '@expo/vector-icons';
import COLORS from './../../constants/colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from './../../store/authStore';


export default function Signup() {
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, register, token } = useAuthStore();

  const router = useRouter();

  const handleSignUp = async () => {
    const result = await register(cedula, email, password);

    if(!result.success) Alert.alert("Error", result.error);

  };

  //console.log(user)
  //console.log(token)


  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS === "ios" ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/*header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bookworm Store</Text>
            <Text style={styles.subtitle}>Make your style shine</Text>
          </View>

          <View style={styles.formContainer}>
            {/* username  input */}
            <View style={styles.inputGroup}>
              {/*RECUERDA la CEDULA EN ESTE INPUT */}
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />

                {/*RECUERDA la CEDULA EN  ESTE INPUT */}
                <TextInput
                  style={styles.input}
                  placeholder='jhondoe'
                  placeholderTextColor={COLORS.placeholderText}
                  value={cedula}
                  onChangeText={setCedula}
                  autoCapitalize='none'
                />
              </View>
            </View>

          {/* email input */}
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
                placeholder="jhondoe@gmail.com"
                value={email}
                placeholderTextColor={COLORS.placeholderText}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>
          </View>

          {/* password input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='******'
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress = {() => setShowPassword(!showPassword)}
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

          {/* signup button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color='#fff'/>
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

          {/*FOOTER*/}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>


          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
