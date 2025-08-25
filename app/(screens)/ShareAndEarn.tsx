import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const ShareAndEarnScreen = () => {
  const router = useRouter();

  const inviteLink = "https://yourapp.com/invite?code=FRIEND123"; // Enlace de invitación de ejemplo
  const inviteMessage = `¡Únete a TNB y obtén un servicio de $19! Usa mi enlace: ${inviteLink}`;

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: inviteMessage,
        url: inviteLink, 
        title: '¡Obtén un servicio de $19!', 
      });

      if (result.action === Share.sharedAction) {
        console.log('Contenido compartido exitosamente');
      } else if (result.action === Share.dismissedAction) {
        console.log('El usuario canceló la acción de compartir');
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copiado', 'El enlace de invitación ha sido copiado a tu portapapeles.');
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Send a $19 mow by sharing an invite link.</Text>
        
        <View style={styles.inviteLinkContainer}>
          <TextInput
            style={styles.inviteLinkInput}
            value={inviteLink}
            editable={false}
          />
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.shareButton, styles.facebook]} onPress={onShare}>
          <FontAwesome name="facebook-square" size={24} color="white" />
          <Text style={styles.shareButtonText}>Share on Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shareButton, styles.twitter]} onPress={onShare}>
          <FontAwesome name="twitter-square" size={24} color="white" />
          <Text style={styles.shareButtonText}>Share on Twitter</Text>
        </TouchableOpacity>

        {/* NextDoor no tiene un ícono estándar, usamos uno genérico */}
        <TouchableOpacity style={[styles.shareButton, styles.nextdoor]} onPress={onShare}>
          <FontAwesome name="share-alt-square" size={24} color="white" />
          <Text style={styles.shareButtonText}>Share on NextDoor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },inviteLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  inviteLinkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  copyButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  facebook: {
    backgroundColor: '#3b5998',
  },
  twitter: {
    backgroundColor: '#1da1f2',
  },
  nextdoor: {
    backgroundColor: '#00b289', // Color de marca de NextDoor
  },
});

export default ShareAndEarnScreen;

