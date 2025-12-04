import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Button } from './Button';
import { Typography } from './Typography';
import { getCropperHtml } from './cropperHtml';

interface ImageCropEditorProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onCropComplete: (croppedUri: string) => void;
}

export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
  visible,
  imageUri,
  onClose,
  onCropComplete,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>('');

  // Load image as base64 when modal opens
  React.useEffect(() => {
    if (visible && imageUri) {
      loadImageAsBase64();
    }
  }, [visible, imageUri]);

  const loadImageAsBase64 = async () => {
    try {
      setLoading(true);
      // Use new File API from expo-file-system v54
      const file = new FileSystem.File(imageUri);
      const base64 = await file.base64();
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('Failed to load image:', error);
      Alert.alert('Error', 'Failed to load image for cropping');
      onClose();
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          setLoading(false);
          break;

        case 'cropped':
          setProcessing(true);
          try {
            // Convert base64 back to file using new API
            const base64Data = message.data.split(',')[1];
            const filename = `cropped_${Date.now()}.jpg`;
            const fileUri = FileSystem.documentDirectory + filename;

            // Use new File API to write
            const file = new FileSystem.File(fileUri);
            await file.create();
            await file.write(base64Data, { encoding: 'base64' });

            onCropComplete(fileUri);
            onClose();
          } catch (error) {
            console.error('Failed to save cropped image:', error);
            Alert.alert('Error', 'Failed to save cropped image');
          } finally {
            setProcessing(false);
          }
          break;

        case 'error':
          Alert.alert('Error', message.message || 'An error occurred');
          setLoading(false);
          setProcessing(false);
          break;
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  const handleCrop = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'crop' }));
    }
  };

  const handleRotate = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'rotate', degrees: 90 }));
    }
  };

  const handleReset = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'reset' }));
    }
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Typography variant="h4" style={styles.headerTitle}>
            Crop Image
          </Typography>
          <View style={styles.iconButton} />
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {imageBase64 ? (
            <WebView
              ref={webViewRef}
              source={{ html: getCropperHtml(imageBase64) }}
              onMessage={handleMessage}
              style={styles.webView}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              mixedContentMode="always"
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
            />
          ) : null}

          {/* Loading Overlay */}
          {(loading || processing) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Typography variant="body1" style={styles.loadingText}>
                {processing ? 'Processing...' : 'Loading...'}
              </Typography>
            </View>
          )}
        </View>

        {/* Toolbar */}
        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.toolButtons}>
            <TouchableOpacity style={styles.toolButton} onPress={handleRotate}>
              <MaterialIcons name="rotate-right" size={24} color="white" />
              <Typography variant="caption" style={styles.toolText}>
                Rotate
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolButton} onPress={handleReset}>
              <MaterialIcons name="refresh" size={24} color="white" />
              <Typography variant="caption" style={styles.toolText}>
                Reset
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Done"
              onPress={handleCrop}
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading || processing}
            />
          </View>
        </View>
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
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    width: 40,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
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
  toolbar: {
    backgroundColor: '#000',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  toolButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    gap: 4,
  },
  toolText: {
    color: 'white',
  },
  actionButtons: {
    marginBottom: 8,
  },
});
