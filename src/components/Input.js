import { StyleSheet, Text, View, TextInput } from 'react-native';
import React, { useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';
export default function input({
  label,
  error,
  placeholder,
  calendar,
  show,
  setShow,
  onFocus = () => { },
  onBlur = () => { },
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);


  return (
    <View accessibilityLabel="input_View_1" style={{ marginBottom: 7 }}>
      <Text accessibilityLabel="input_Text_1" style={styles.labelStyle}>{label}</Text>
      <View
        accessibilityLabel="input_View_1.2"
        style={[
          styles.inputContainer,
          { borderColor: error ? 'red' : isFocused ? 'blue' : 'grey' },
        ]}>
        <TextInput
          accessibilityLabel="input_TextInput_1"
          //   secureTextEntry={hidePassword}
          placeholder={placeholder}
          {...props}
          autoCorrect={false}
          onFocus={() => {
            onFocus();
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          style={{ flex: 1, color: 'black', fontSize: 20, fontWeight: '400' }}
        />

        {calendar && (
          <Feather
            accessibilityLabel="input_Icon_1"
            name={'calendar'}
            color={'black'}
            size={25}
            style={{ margin: 5, paddingRight: 12 }}
            onPress={() => setShow(!show)}
          />
        )}
      </View>
      {error && (
        <Text
          accessibilityLabel="input_Text_2"
          style={{ color: 'red', fontSize: 12, marginTop: 7, paddingLeft: 5, left: 25 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelStyle: {
    paddingTop: 5,
    marginBottom: 7,
    color: 'black',
    marginLeft: 24,
    fontFamily: 'Roboto',
    fontSize: 23,
    fontWeight: '200',
    margin: 5
  },
  inputContainer: {
    height: 55,
    backgroundColor: 'white',
    borderWidth: 0.5,
    elevation: 5,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    borderRadius: 8,
    paddingLeft: 12
  },
});