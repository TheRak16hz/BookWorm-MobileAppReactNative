import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import styles from "../../assets/styles/create.styles"
import COLORS from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from "../../constants/api.js";


export default function create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); //to display the selected image
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore()

  //console.log("Token: ", token);

  const pickImage = async () => {
    try {
      //request permission if needed
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        //console.log({status});
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'We need camera roll permissions to upload an image');
          return;
        }
      }

      //launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, //reduce quality for smaller base64
        base64: true,
      });

      if (!result.canceled) {
        //console.log("result is here: ", result);
        setImage(result.assets[0].uri);

        //if base64 is provided, use it
        if(result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          //otherwise, convert to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // get file extension from URI or default to jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : 'image/jpeg';

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      console.log("Token actual:", token);

      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating,
          image: imageDataUrl, //send base64 image
        }),
      })

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      Alert.alert("Success", "Book recommendation has been posted!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/"); //navigate to homescreen

    } catch (error) {
      console.error("Error creating post: ", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const starts = [];
    for (let i = 1; i <= 5; i++) {
      starts.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? '#f4b400' : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{starts}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/*HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recomendation</Text>
            <Text style={styles.subtitle}>Share your favorite reads with others</Text>
          </View>
          <View style={styles.form}>
            {/*BOOK TITLE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/*RATING */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
            {renderRatingPicker()}
            </View>

            {/*IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage}/>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name='image-outline' size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}

              </TouchableOpacity>
            </View>

            {/*CAPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter your review or thoughts about this book..."
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            {/*SUBMIT BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (

                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Submit</Text>
                  </>
                )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}