import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import { Alert } from 'react-native'
import { authService } from '../services/api/authService'
import { personAddressService } from '../services/api/personAddressService'
import { personPhoneService } from '../services/api/personPhoneService'
import { personService } from '../services/api/personService'
import type { RegistrationFormData } from '../types/registration'

export const useRegistration = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerUser = async (formData: RegistrationFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Get email and password from AsyncStorage
      const email = await AsyncStorage.getItem('emailForSignIn')
      const password = await AsyncStorage.getItem('passwordForSignUp')

      if (!email || !password) {
        throw new Error('Email or password not found. Please restart the registration process.')
      }

      // Step 2: Create Person
      const personResponse = await personService.createPerson({
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
      })

      const personId = personResponse.id

      // Step 3: Create User
      await authService.createUser({
        fkPerson: personId,
        email,
        password,
      })

      // Step 4: Create Person Phone
      await personPhoneService.createPersonPhone({
        fkPerson: personId,
        countryCode: formData.countryCode,
        phoneNumber: formData.phoneNumber,
      })

      // Step 5: Create Person Address
      await personAddressService.createPersonAddress({
        fkPerson: personId,
        addressLine1: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      })

      // Step 6: Clean up AsyncStorage
      await AsyncStorage.removeItem('emailForSignIn')
      await AsyncStorage.removeItem('passwordForSignUp')

      setLoading(false)
      return { success: true, personId }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during registration'
      setError(errorMessage)
      setLoading(false)
      Alert.alert('Registration Error', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    loading,
    error,
    registerUser,
  }
}
