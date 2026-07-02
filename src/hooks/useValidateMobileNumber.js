import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';

export default function useValidateMobileNumber() {
  const isValidPhoneNumber = phoneNumber =>
    /^[0-9]\d{2}\d{3}\d{4}$/.test(phoneNumber);

  function handleMobileNumberValidation(phoneNumber) {
    const isValid = isValidPhoneNumber(phoneNumber);

    const validityChanged =
      (phoneNumber && isValid) || (!phoneNumber && !isValid);
    if (validityChanged) {
      // console.log('moblie number validation', isValid ? 'Valid' : 'Invalid');
    }

    return isValid;
  }

  return {
    handleMobileNumberValidation,
  };
}
