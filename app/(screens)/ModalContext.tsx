import React, { createContext, useState, Dispatch, SetStateAction } from 'react';

interface ModalContextType {  // Define la interfaz para el contexto
  isSignUpModalVisible: boolean;
  setIsSignUpModalVisible: Dispatch<SetStateAction<boolean>>;
  isPhoneModalVisible: boolean;
  setIsPhoneModalVisible: Dispatch<SetStateAction<boolean>>;
  isEmailModalVisible: boolean;
  setIsEmailModalVisible: Dispatch<SetStateAction<boolean>>;
}

export const ModalContext = createContext<ModalContextType>({ // Define el tipo del contexto y un valor por defecto
  isSignUpModalVisible: false,
  setIsSignUpModalVisible: () => {}, // Función vacía por defecto
  isPhoneModalVisible: false,
  setIsPhoneModalVisible: () => {},
  isEmailModalVisible: false,
  setIsEmailModalVisible: () => {},
});


export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => { // Tipa children
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  const value = { // Crea el objeto value
    isSignUpModalVisible,
    setIsSignUpModalVisible,
    isPhoneModalVisible,
    setIsPhoneModalVisible,
    isEmailModalVisible,
    setIsEmailModalVisible,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};