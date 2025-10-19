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

      console.log('[useRegistration] Starting registration process')
      console.log('Step 1: Email and password from storage')

      // Step 2: Create Person
      console.log('Step 2: Creating person...')
      const personResponse = await personService.createPerson({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.birthDate,
      })

      const personId = personResponse.pkPerson
      console.log('✅ Person created with ID:', personId)

      // Combinar countryCode + phoneNumber en un solo string
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`

      // Step 3: Create User (SIN campo phone - el phone va solo en person-phone)
      console.log('Step 3: Creating user...')
      await authService.createUser({
        fkPerson: personId,
        fkProfile: 1, // OBLIGATORIO - siempre usar 1 por ahora
        email,
        password,
      })
      console.log('✅ User created successfully')

      // Step 4: Create Person Phone
      console.log('Step 4: Creating person phone...')
      await personPhoneService.createPersonPhone({
        fkPerson: personId,
        phone: fullPhone,
        isPrimary: 1,
      })
      console.log('✅ Person phone created:', fullPhone)

      // Step 5: Create Person Address
      console.log('Step 5: Creating person address...')
      const addressData = {
        fkPerson: personId,
        address: formData.address,
        addressLine2: formData.addressLine2,
        zipCode: formData.zipCode,
        isPrimary: 1,
        latitude: formData.latitude,
        longitude: formData.longitude,
        country: 1, // USA siempre es ID 1
        state: formData.stateId,
        city: formData.cityId,
      }

      console.log('Address data:', JSON.stringify(addressData, null, 2))

      await personAddressService.createPersonAddress(addressData)
      console.log('✅ Person address created')

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
