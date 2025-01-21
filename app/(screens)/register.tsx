/*
import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import VerifyCode from './verificode';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es obligatorio'),
    lastName: Yup.string().required('Apellido es obligatorio'),
    address: Yup.string().required('Dirección es obligatoria'),
    email: Yup.string().email('Email inválido').required('Email es obligatorio')
  });

  const handleNext = (values: any) => {
    window.localStorage.setItem('emailForSignIn', values.email);
    setShowVerifyCode(true);
    console.log("Datos válidos, verificación en proceso");
    // Aquí puedes manejar el envío del correo de verificación
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {!showVerifyCode ? (
        <Formik
          initialValues={{ name: '', lastName: '', address: '', email: '' }}
          validationSchema={validationSchema}
          onSubmit={handleNext}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <View style={styles.modalContainer}>
              <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Registro de Usuario</Text>

              <Text style={styles.textH2Black}>Nombre</Text>
              <TextInput
                style={[{ marginBottom: 15 }, styles.input]}
                placeholder="Nombre"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {errors.name && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.name}</Text>}

              <Text style={styles.textH2Black}>Apellido</Text>
              <TextInput
                style={[{ marginBottom: 15 }, styles.input]}
                placeholder="Apellido"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
              />
              {errors.lastName && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.lastName}</Text>}

              <Text style={styles.textH2Black}>Dirección</Text>
              <TextInput
                style={[{ marginBottom: 15 }, styles.input]}
                placeholder="Dirección"
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                value={values.address}
              />
              {errors.address && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.address}</Text>}

              <Text style={styles.textH2Black}>Correo Electrónico o Teléfono</Text>
              <TextInput
                style={[{ marginBottom: 15 }, styles.input]}
                placeholder="johndoe@gmail.com"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {errors.email && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.email}</Text>}

              <View style={styles.containerTermsofServices}>
                <Text style={styles.TermsofServices}> Al continuar, aceptas nuestros </Text>
                <Text style={[styles.TermsofServices, styles.underlineText]}>Términos de Servicio</Text>
                <Text style={styles.TermsofServices}> y </Text>
                <Text style={[styles.TermsofServices, styles.underlineText]}>Política de Privacidad</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
                  <Text style={styles.buttonText}>Atrás</Text>
                  <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonRight]} onPress={handleSubmit}> 
                  <Text style={styles.buttonText}>Siguiente</Text> 
                  <FontAwesome name="arrow-right" size={24} color="white" /> 
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      ) : (
        <VerifyCode isVisible={isVisible} onClose={onClose} />
      )}
    </Modal>
  );
};

export default SignUp;
*/