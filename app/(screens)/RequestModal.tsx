import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Request: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [selectedService, setSelectedService] = useState('');
  const [images, setImages] = useState([]);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const validationSchema = Yup.object().shape({
    requirement: Yup.string().required('Requirement is required'),
    description: Yup.string().required('Description is required'),
    address: Yup.string().required('Address is required'),
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="close" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <MaterialIcons name="business" size={80} color="#f54021" />
            <Text style={styles.titleText}>Commercial Construction</Text>
          </View>

          <Formik
            initialValues={{
              service: '',
              requirement: '',
              description: '',
              address: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              console.log(values, images);
              onClose(); 
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <Picker
                  selectedValue={selectedService}
                  onValueChange={(itemValue) => {
                    setSelectedService(itemValue);
                    handleChange('service')(itemValue);
                  }}
                  style={styles.input}
                >
                  <Picker.Item label="Select a Service" value="" />
                  <Picker.Item label="Plumbing" value="plumbing" />
                  <Picker.Item label="Electrical" value="electrical" />
                  <Picker.Item label="Carpentry" value="carpentry" />
                  {/* Agrega más servicios según sea necesario */}
                </Picker>

                <TextInput
                  style={styles.input}
                  placeholder="Requirement"
                  onChangeText={handleChange('requirement')}
                  onBlur={handleBlur('requirement')}
                  value={values.requirement}
                />
                {touched.requirement && errors.requirement && (
                  <Text style={styles.errorText}>{errors.requirement}</Text>
                )}

                <TextInput
                  style={styles.descriptionInput} 
                  placeholder="Description"
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  multiline
                />
                {touched.description && errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  value={values.address}
                />
                {touched.address && errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}

                <View style={styles.buttonContainer}>
                  <View style={styles.button} >
                    <Button title="Upload Images" color="#f54021" onPress={handleImagePicker} />
                  </View>
                  <View style={styles.button}>
                    <Button title="Save" onPress={handleSubmit} />
                  </View>
                </View>

              </View>
            )}
          </Formik>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  descriptionInput: { 
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20, 
    borderRadius: 5,
    height: 100, 
    textAlignVertical: 'top', 
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  buttonContainer: { 
    marginTop: 20, 
    justifyContent: 'space-around', 
  },
  button: {
    flex: 1, 
    marginTop: 10,
    marginHorizontal: 5, 
  },
});

export default Request;
