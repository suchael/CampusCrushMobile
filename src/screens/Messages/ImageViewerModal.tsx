import React from 'react';
import { View, StyleSheet, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ visible, imageUrl, onClose }: ImageViewerModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Background closer catcher */}
        <TouchableOpacity style={styles.absoluteCloseTarget} onPress={onClose} activeOpacity={1} />
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>

        <Image source={{ uri: imageUrl }} style={styles.fullImage} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 14, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteCloseTarget: {
    ...StyleSheet.absoluteFill,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: width,
    height: height * 0.7,
    resizeMode: 'contain',
  },
});