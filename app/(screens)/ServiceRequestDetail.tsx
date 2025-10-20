import { MigratedStyles } from '@/constants/MigratedStyles';
import { Theme } from '@/constants/Theme';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

  // Parse service data
  const service: ServiceRequest | null = serviceString && typeof serviceString === 'string' 
    ? JSON.parse(serviceString) 
    : null;

  const {
    latitude = '',
    longitude = '',
    address = '',
    serviceDescription = '',
    createdAt = '',
    statusInfo = { text: '', color: '' },
    requestId = 0,
  } = service || {};

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

  if (!serviceString || typeof serviceString !== 'string') {
    return (
      <View style={MigratedStyles.serviceDetailErrorContainer}>
        <Text>Error: No se proporcionaron datos del servicio.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={MigratedStyles.serviceDetailBackLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]}
      />
      <View style={MigratedStyles.serviceDetailContainer}>
        <View style={MigratedStyles.serviceDetailHeader}>
        <TouchableOpacity onPress={() => router.back()} style={MigratedStyles.serviceDetailBackButton}>
          <Icon name="arrow-back" size={28} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={MigratedStyles.serviceDetailHeaderTitle}>Service Details</Text>
      </View>

      <ScrollView contentContainerStyle={MigratedStyles.serviceDetailScrollContent}>
        <View style={MigratedStyles.serviceDetailCard}>
          <Text style={MigratedStyles.serviceDetailTitle}>{serviceDescription || 'Sin Descripción'}</Text>
          <Text style={MigratedStyles.serviceDetailRequestId}>Request ID: #{requestId}</Text>

          <View style={MigratedStyles.serviceDetailSeparator} />

          <View style={MigratedStyles.serviceDetailRow}>
            <Icon name="location-on" size={22} color={Theme.colors.text.secondary} style={MigratedStyles.serviceDetailIcon} />
            <Text style={MigratedStyles.serviceDetailText}>{address || 'Dirección no proporcionada'}</Text>
          </View>

          <View style={MigratedStyles.serviceDetailRow}>
            <Icon name="event" size={22} color={Theme.colors.text.secondary} style={MigratedStyles.serviceDetailIcon} />
            <Text style={MigratedStyles.serviceDetailText}>
             Created on: {new Date(createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          <View style={MigratedStyles.serviceDetailRow}>
            <Icon name="hourglass-empty" size={22} color={Theme.colors.text.secondary} style={MigratedStyles.serviceDetailIcon} />
            <View style={[MigratedStyles.serviceDetailStatusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={MigratedStyles.serviceDetailStatusBadgeText}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        {mapRegion ? (
          <View style={MigratedStyles.serviceDetailMapCard}>
            <Text style={MigratedStyles.serviceDetailMapTitle}>Service Location</Text>
            <View style={MigratedStyles.serviceDetailMapContainer}>
              <MapView style={MigratedStyles.serviceDetailMap} initialRegion={mapRegion}>
                <Marker coordinate={mapRegion} title={address} />
              </MapView>
            </View>
          </View>
        ) : (
          <View style={MigratedStyles.serviceDetailMapCard}>
             <Text style={MigratedStyles.serviceDetailMapTitle}>Service Location</Text>
             <View style={MigratedStyles.serviceDetailNoMapContainer}>
                <Icon name="location-off" size={40} color={Theme.colors.text.tertiary} />
                <Text style={MigratedStyles.serviceDetailNoMapText}>Location data not available for this request.</Text>
             </View>
          </View>
        )}

        <View style={MigratedStyles.serviceDetailImageCard}>
          <Text style={MigratedStyles.serviceDetailMapTitle}>Request Images</Text>
          {loadingImages ? (
            <ActivityIndicator size="large" color={Theme.colors.primary[500]} style={{ marginVertical: Theme.spacing.lg }} />
          ) : images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={MigratedStyles.serviceDetailImagePreviewContainer}>
                {images.map((image, index) => (
                  <TouchableOpacity key={image.imageId} onPress={() => openImageModal(index)}>
                    <Image
                      source={{ uri: `${API_URL}${image.urlImage}` }}
                      style={MigratedStyles.serviceDetailPreviewImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={MigratedStyles.serviceDetailNoMapContainer}>
              <Icon name="image-not-supported" size={40} color={Theme.colors.text.tertiary} />
              <Text style={MigratedStyles.serviceDetailNoMapText}>No images were uploaded for this request.</Text>
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
        <View style={MigratedStyles.serviceDetailImageModalContainer}>
          <TouchableOpacity style={MigratedStyles.serviceDetailModalCloseButton} onPress={closeImageModal}>
            <Icon name="close" size={32} color={Theme.colors.text.inverse} />
          </TouchableOpacity>
          <FlatList
            data={images}
            renderItem={({ item }) => (
              <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: `${API_URL}${item.urlImage}` }}
                  style={MigratedStyles.serviceDetailModalImage}
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
    </>
  );
};

export default ServiceRequestDetailScreen;

