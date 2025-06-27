import { View, Text, StyleSheet } from 'react-native';

export default function VerPosts() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla Ver Posts (en construcción)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
  }
});
