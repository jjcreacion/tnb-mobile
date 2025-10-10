import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import * as Yup from 'yup';

// Theme System Components
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Typography } from '../../components/common/Typography';
import { MigratedStyles } from '../../constants/MigratedStyles';
import { Theme } from '../../constants/Theme';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginEmailMigrated: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensajeErrorUsuario, setMensajeErrorUsuario] = useState<string | null>(null);

  const handleLogin = async (values: any) => {
    setLoading(true);
    setMensajeErrorUsuario(null);
    console.log("Enviando...");
    try {
      /*
      const response = await axios.post('http://192.168.1.8:3000/users/login/email', {
        email: values.email,
        password: values.password,
      });

      const token = response.data.token;

      await AsyncStorage.setItem('token', token);
      setLoading(false);
      */
      router.push('/(tabs)');
      onClose();

    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          setMensajeErrorUsuario("Incorrect credentials. Try again.");
        } else {
          setMensajeErrorUsuario("There was an error logging in. Please try again later.");
        }
      } else if (error.request) {
        setMensajeErrorUsuario("Could not connect to the server.");
      } else {
        setMensajeErrorUsuario("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          handleLogin(values);
        }}
      >
        {({ handleChange, handleBlur, values, errors, touched, isValid, handleSubmit }) => (
          <View style={MigratedStyles.modalContainer}>
            <Typography 
              variant="h1" 
              color="error" 
              style={{ marginBottom: Theme.spacing.lg }}
            >
              Enter Your Credentials
            </Typography>

            <Typography variant="h2" color="primary" style={{ marginBottom: Theme.spacing.xs }}>
              Email
            </Typography>
            <Input
              placeholder="Enter your email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              error={touched.email && errors.email ? errors.email : undefined}
              style={{ marginBottom: Theme.spacing.md }}
            />

            <Typography variant="h2" color="primary" style={{ marginBottom: Theme.spacing.xs }}>
              Password
            </Typography>
            <Input
              placeholder=""
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              error={touched.password && errors.password ? errors.password : undefined}
              style={{ marginBottom: Theme.spacing.md }}
            />

            {loading && (
              <Loading 
                size="lg" 
                color={Theme.colors.primary[500]} 
                style={{ marginVertical: Theme.spacing.lg }} 
              />
            )}

            {mensajeErrorUsuario && (
              <Typography 
                variant="caption" 
                color="error" 
                style={{ 
                  marginTop: Theme.spacing.sm,
                  marginBottom: Theme.spacing.md,
                  textAlign: 'center' 
                }}
              >
                {mensajeErrorUsuario}
              </Typography>
            )}

            <View style={MigratedStyles.buttonContainer2}>
              <Button
                title="Back"
                variant="secondary"
                onPress={onClose}
                icon={<FontAwesome name="arrow-left" size={24} color="white" />}
                iconPosition="right"
                style={{ flex: 1, marginRight: Theme.spacing.sm }}
              />
              <Button
                title="Login"
                variant="primary"
                onPress={() => {
                  if (isValid) {
                    handleSubmit();
                  }
                }}
                disabled={!isValid}
                icon={<FontAwesome name="sign-in" size={24} color="white" />}
                iconPosition="right"
                style={{ flex: 1, marginLeft: Theme.spacing.sm }}
              />
            </View>
          </View>
        )}
      </Formik>
    </Modal>
  );
};

export default LoginEmailMigrated;