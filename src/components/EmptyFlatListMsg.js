import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window')

export default function EmptyFlatListMsg({ Message, headerImage, navigate }) {
  const navigation = useNavigation();
  return (
    <>
      <TouchableOpacity accessibilityLabel="EmptyFlatListMsg_TouchableOpacity_1" style={styles.item} onPress={() => { navigate != null ? navigation.navigate(navigate, { item: null }) : '' }}>
        <Text accessibilityLabel="EmptyFlatListMsg_Text_1" style={styles.textStyle}>
          {Message}
        </Text>
      </TouchableOpacity>
    </>

  )
}

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 35,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'black'

  },
  item: {
    justifyContent: 'center',
    width: '98%',
    borderColor: 'grey',
    padding: 4, backgroundColor: 'white',
    margin: 4,
    alignSelf: 'center',
    borderWidth: .6,
    borderColor: '#BCBCBC'
  },
})