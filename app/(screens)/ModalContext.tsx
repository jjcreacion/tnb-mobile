import React, { createContext, useState, Dispatch, SetStateAction } from 'react';

interface ModalContextType {  
  isSignUpModalVisible: boolean;
  setIsSignUpModalVisible: Dispatch<SetStateAction<boolean>>;
  isPhoneModalVisible: boolean;
  setIsPhoneModalVisible: Dispatch<SetStateAction<boolean>>;
  isEmailModalVisible: boolean;
  setIsEmailModalVisible: Dispatch<SetStateAction<boolean>>;
}

export const ModalContext = createContext<ModalContextType>({ 
  isSignUpModalVisible: false,
  setIsSignUpModalVisible: () => {}, 
  isPhoneModalVisible: false,
  setIsPhoneModalVisible: () => {},
  isEmailModalVisible: false,
  setIsEmailModalVisible: () => {},
});


export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => { 
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  const value = { 
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