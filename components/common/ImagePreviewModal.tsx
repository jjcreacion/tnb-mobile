import { Theme } from '@/constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Button } from './Button';
import { Loading } from './Loading';
import { Typography } from './Typography';
import { getCropperHtml } from './cropperHtml';

interface ImagePreviewModalProps {
  visible: boolean;
  images: string[];
  onClose: () => void;
  onConfirm: (finalImages: string[]) => void;
  onAddMore: () => Promise<void>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  images: initialImages,
  onClose,
  onConfirm,
  onAddMore,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  
  const [currentImages, setCurrentImages] = useState<string[]>(initialImages);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Crop mode state
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropImageBase64, setCropImageBase64] = useState<string>('');
  const [cropLoading, setCropLoading] = useState(false);

  // Animation values
  const footerOpacity = useSharedValue(1);
  const footerTranslateY = useSharedValue(0);
  const toolbarOpacity = useSharedValue(1);

  // Sync state when prop changes
  React.useEffect(() => {
    const previousLength = currentImages.length;
    setCurrentImages(initialImages);
    
    // If new images were added, select the last one
    if (initialImages.length > previousLength) {
      setSelectedIndex(initialImages.length - 1);
    } else if (initialImages.length > 0 && selectedIndex >= initialImages.length) {
      // If images were removed and current index is out of bounds
      setSelectedIndex(Math.max(0, initialImages.length - 1));
    }
  }, [initialImages]);

  // Reset crop mode when modal closes
  React.useEffect(() => {
    if (!visible) {
      setIsCropMode(false);
      setCropImageBase64('');
      // Reset animations
      footerOpacity.value = 1;
      footerTranslateY.value = 0;
      toolbarOpacity.value = 1;
    }
  }, [visible]);

  // Animate transitions when entering/exiting crop mode
  React.useEffect(() => {
    if (isCropMode) {
      // Entering crop mode
      // Footer slides down and fades out
      footerOpacity.value = withTiming(0, { duration: 250 });
      footerTranslateY.value = withSpring(150, { damping: 20, stiffness: 90 });
      
      // Toolbar stays in place but content changes with fade
      toolbarOpacity.value = withTiming(0, { duration: 150 }, () => {
        toolbarOpacity.value = withTiming(1, { duration: 250 });
      });
    } else {
      // Exiting crop mode
      // Footer slides up and fades in
      footerOpacity.value = withTiming(1, { duration: 300 });
      footerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      
      // Toolbar content changes with fade
      toolbarOpacity.value = withTiming(0, { duration: 150 }, () => {
        toolbarOpacity.value = withTiming(1, { duration: 250 });
      });
    }
  }, [isCropMode]);

  // Animated styles
  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
    transform: [{ translateY: footerTranslateY.value }],
  }));

  const toolbarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toolbarOpacity.value,
  }));

  const handleRemoveCurrent = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = currentImages.filter((_, i) => i !== selectedIndex);
            setCurrentImages(newImages);
            if (newImages.length === 0) {
              onClose();
            } else if (selectedIndex >= newImages.length) {
              setSelectedIndex(newImages.length - 1);
            }
          },
        },
      ]
    );
  };

  const handleRotate = async () => {
    if (currentImages.length === 0) return;
    setLoading(true);
    try {
      const uri = currentImages[selectedIndex];
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: 90 }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      const newImages = [...currentImages];
      newImages[selectedIndex] = result.uri;
      setCurrentImages(newImages);
    } catch (error) {
      console.error('Rotation failed:', error);
      Alert.alert('Error', 'Failed to rotate image');
    } finally {
      setLoading(false);
    }
  };

  // Enter crop mode
  const handleEnterCropMode = async () => {
    if (currentImages.length === 0) return;
    console.log('[Crop] Entering crop mode for image:', currentImages[selectedIndex]);
    
    // Set mode first to start animations
    setIsCropMode(true);
    setCropLoading(true);
    
    try {
      const imageUri = currentImages[selectedIndex];
      const file = new FileSystem.File(imageUri);
      const base64 = await file.base64();
      console.log('[Crop] Image loaded as base64, length:', base64.length);
      setCropImageBase64(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('[Crop] Failed to load image:', error);
      Alert.alert('Error', 'Failed to load image for cropping');
      setIsCropMode(false);
      setCropImageBase64('');
      setCropLoading(false);
    }
    // Don't set loading to false here - let WebView 'ready' message do it
  };

  // Handle WebView messages
  const handleCropMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('[Crop] WebView message:', message.type);

      switch (message.type) {
        case 'ready':
          console.log('[Crop] WebView ready');
          setCropLoading(false);
          break;

        case 'cropped':
          console.log('[Crop] Processing cropped image');
          setCropLoading(true);
          try {
            const base64Data = message.data.split(',')[1];
            const filename = `cropped_${Date.now()}.jpg`;
            
            // Get the cache directory for the current platform
            const cacheDir = FileSystemLegacy.cacheDirectory;
            if (!cacheDir) {
              throw new Error('Cache directory not available');
            }
            
            const fileUri = cacheDir + filename;
            console.log('[Crop] Saving to:', fileUri);

            // Use legacy API to write base64 data
            await FileSystemLegacy.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystemLegacy.EncodingType.Base64,
            });

            console.log('[Crop] Saved cropped image to:', fileUri);
            const newImages = [...currentImages];
            newImages[selectedIndex] = fileUri;
            setCurrentImages(newImages);
            setIsCropMode(false);
            setCropImageBase64('');
          } catch (error) {
            console.error('[Crop] Failed to save cropped image:', error);
            Alert.alert('Error', 'Failed to save cropped image');
          } finally {
            setCropLoading(false);
          }
          break;

        case 'error':
          console.error('[Crop] WebView error:', message.message);
          Alert.alert('Error', message.message || 'An error occurred');
          setCropLoading(false);
          break;
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  const handleCropDone = () => {
    console.log('[Crop] Done button pressed');
    if (webViewRef.current) {
      console.log('[Crop] Sending crop command to WebView');
      webViewRef.current.postMessage(JSON.stringify({ action: 'crop' }));
    } else {
      console.error('[Crop] WebView ref is null');
    }
  };

  const handleCropReset = () => {
    console.log('[Crop] Reset button pressed');
    if (webViewRef.current) {
      console.log('[Crop] Sending reset command to WebView');
      webViewRef.current.postMessage(JSON.stringify({ action: 'reset' }));
    } else {
      console.error('[Crop] WebView ref is null');
    }
  };

  const handleCropRotate = () => {
    console.log('[Crop] Rotate button pressed in crop mode');
    if (webViewRef.current) {
      console.log('[Crop] Sending rotate command to WebView');
      webViewRef.current.postMessage(JSON.stringify({ action: 'rotate', degrees: 90 }));
    } else {
      console.error('[Crop] WebView ref is null');
    }
  };

  const handleCropCancel = () => {
    setIsCropMode(false);
    setCropImageBase64('');
  };

  const handleConfirm = () => {
    onConfirm(currentImages);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header - Dynamic based on mode */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={isCropMode ? handleCropCancel : onClose} 
            style={styles.iconButton}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Typography variant="h4" style={styles.headerTitle}>
            {isCropMode ? 'Crop Image' : `${selectedIndex + 1} of ${currentImages.length}`}
          </Typography>
          
          <TouchableOpacity 
            onPress={isCropMode ? handleCropDone : handleRemoveCurrent} 
            style={styles.iconButton}
            disabled={cropLoading}
          >
            <MaterialIcons 
              name={isCropMode ? 'check' : 'delete-outline'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Main Preview / Crop Editor */}
        <View style={styles.previewContainer}>
          {isCropMode ? (
            // Crop Mode - WebView
            <View style={styles.cropContainer}>
              {cropImageBase64 ? (
                <>
                  <WebView
                    ref={webViewRef}
                    source={{ html: getCropperHtml(cropImageBase64) }}
                    onMessage={handleCropMessage}
                    style={styles.webView}
                    scrollEnabled={false}
                    bounces={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    mixedContentMode="always"
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.error('[Crop] WebView error:', nativeEvent);
                    }}
                    onLoad={() => console.log('[Crop] WebView loaded')}
                  />
                </>
              ) : (
                // Show current image while loading base64
                <Image
                  source={{ uri: currentImages[selectedIndex] }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              )}
            </View>
          ) : (
            // Preview Mode - Image
            currentImages.length > 0 ? (
              <Image
                source={{ uri: currentImages[selectedIndex] }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.emptyState}>
                <Typography variant="body1" style={{ color: 'white' }}>
                  No images selected
                </Typography>
              </View>
            )
          )}
        </View>

        {/* Toolbar - Dynamic based on mode */}
        <Animated.View style={[styles.toolbar, toolbarAnimatedStyle]}>
          {isCropMode ? (
            // Crop Mode Toolbar
            <>
              <TouchableOpacity style={styles.toolButton} onPress={handleCropRotate}>
                <MaterialIcons name="rotate-right" size={24} color="white" />
                <Typography variant="caption" style={styles.toolText}>Rotate</Typography>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolButton} onPress={handleCropReset}>
                <MaterialIcons name="refresh" size={24} color="white" />
                <Typography variant="caption" style={styles.toolText}>Reset</Typography>
              </TouchableOpacity>
            </>
          ) : (
            // Preview Mode Toolbar
            <>
              <TouchableOpacity style={styles.toolButton} onPress={handleRotate}>
                <MaterialIcons name="rotate-right" size={24} color="white" />
                <Typography variant="caption" style={styles.toolText}>Rotate</Typography>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.toolButton} onPress={handleEnterCropMode}>
                <MaterialIcons name="crop" size={24} color="white" />
                <Typography variant="caption" style={styles.toolText}>Crop</Typography>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Footer - Only show in preview mode */}
        {!isCropMode && (
          <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }, footerAnimatedStyle]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
              contentContainerStyle={styles.thumbnailContent}
            >
              {currentImages.map((uri, index) => (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  onPress={() => setSelectedIndex(index)}
                  style={[
                    styles.thumbnailItem,
                    selectedIndex === index && styles.thumbnailSelected
                  ]}
                >
                  <Image source={{ uri }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={onAddMore}
              >
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.actionButtons}>
              <Button
                title="Done"
                onPress={handleConfirm}
                variant="primary"
                fullWidth
                size="lg"
              />
            </View>
          </Animated.View>
        )}

        <Loading visible={loading} variant="overlay" message="Processing..." />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  cropContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 32,
  },
  toolButton: {
    alignItems: 'center',
    gap: 4,
  },
  toolText: {
    color: 'white',
  },
  footer: {
    backgroundColor: '#000',
    paddingTop: 16,
  },
  thumbnailList: {
    maxHeight: 80,
    marginBottom: 16,
  },
  thumbnailContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: Theme.colors.primary[500],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  actionButtons: {
    paddingHorizontal: 16,
  },
});
