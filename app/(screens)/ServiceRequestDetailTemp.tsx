import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ServiceRequest {
  requestId: number;
  serviceDescription: string;
  address: string;
  latitude: string;
  longitude: string;
  fkRequestStatus: number | null;
  createdAt: string;
  updatedAt: string | null;
  fkUser: any; 
  statusInfo: {
    text: string;
    color: string;
  };
}

interface ServiceRequestImage {
  imageId: number;
  urlImage: string;
}

const ServiceRequestDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { service: serviceString } = params;
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const { width, height } = Dimensions.get('window');
  const [images, setImages] = useState<ServiceRequestImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  if (!serviceString || typeof serviceString !== 'string') {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: No se proporcionaron datos del servicio.</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const service: ServiceRequest = JSON.parse(serviceString);

  const {
    latitude,
    longitude,
    address,
    serviceDescription,
    createdAt,
    statusInfo,
    requestId,
  } = service;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;

  const mapRegion = hasValidCoordinates ? {
    latitude: lat,
    longitude: lon,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : null;

  useEffect(() => {
    const fetchImages = async () => {
      if (!requestId || !API_URL) {
        setLoadingImages(false);
        return;
      }
      try {
        setLoadingImages(true);
        const response = await fetch(`${API_URL}/request-images/by-request/${requestId}`);
        if (response.ok) {
          const data: ServiceRequestImage[] = await response.json();
          setImages(data);
        } else {
          console.error('Error al obtener las imágenes de la solicitud:', response.status);
        }
      } catch (error) {
        console.error('Error de red al obtener las imágenes de la solicitud:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [requestId, API_URL]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{serviceDescription || 'Sin Descripción'}</Text>
          <Text style={styles.requestId}>Request ID: #{requestId}</Text>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="location-on" size={22} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>{address || 'Dirección no proporcionada'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="event" size={22} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>
             Created on: {new Date(createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="hourglass-empty" size={22} color="#555" style={styles.detailIcon} />
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        {mapRegion ? (
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Service Location</Text>
            <View style={styles.mapContainer}>
              <MapView style={styles.map} initialRegion={mapRegion}>
                <Marker coordinate={mapRegion} title={address} />
              </MapView>
            </View>
          </View>
        ) : (
          <View style={styles.mapCard}>
             <Text style={styles.mapTitle}>Service Location</Text>
             <View style={styles.noMapContainer}>
                <Icon name="location-off" size={40} color="#999" />
                <Text style={styles.noMapText}>Location data not available for this request.</Text>
             </View>
          </View>
        )}

        <View style={styles.imageCard}>
          <Text style={styles.mapTitle}>Request Images</Text>
          {loadingImages ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagePreviewContainer}>
                {images.map((image, index) => (
                  <TouchableOpacity key={image.imageId} onPress={() => openImageModal(index)}>
                    <Image
                      source={{ uri: `${API_URL}${image.urlImage}` }}
                      style={styles.previewImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noMapContainer}>
              <Icon name="image-not-supported" size={40} color="#999" />
              <Text style={styles.noMapText}>No images were uploaded for this request.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={closeImageModal}
        animationType="fade"
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeImageModal}>
            <Icon name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={images}
            renderItem={({ item }) => (
              <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: `${API_URL}${item.urlImage}` }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(item) => item.imageId.toString()}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  requestId: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  mapContainer: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noMapContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noMapText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
      marginTop: 20,
      color: '#007AFF',
      fontSize: 16,
  }
});

export default ServiceRequestDetailScreen;

