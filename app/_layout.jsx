import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from './../store/authStore';
import { useEffect } from "react";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const {checkAuth,user,token} = useAuthStore()

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  })

  useEffect(() => {
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded])

  useEffect(() => {
    checkAuth();
  })

  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } 
    else if (isSignedIn && inAuthScreen) {
      // Redirige según el role
      if (user.role === "admin" || user.role === "profesor" || user.role === "secretaria") {
        router.replace("/(tabs-staff)");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, token, segments]);

  return (

    <SafeAreaProvider>
      <SafeScreen>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
