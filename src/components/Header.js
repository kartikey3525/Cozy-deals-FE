import {View, Text, Dimensions} from 'react-native';
import React, {useContext} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {ThemeContext} from '../context/themeContext';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {useNavigation} from '@react-navigation/native';

export default function Header({header}) {
  const navigation = useNavigation();

  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          width: Width,
          flexDirection: 'row',
          height: Height * 0.1,
          justifyContent: 'flex-start',
        }}>
        <Entypo
          onPress={() => navigation.goBack()}
          name="chevron-thin-left"
          size={20}
          color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
          style={{marginLeft: 20, padding: 5}}
        />
        <Text
          style={[
            {
              fontSize: 20,
              fontWeight: 'bold',
              alignSelf: 'center',
              textAlign: 'center',
              width: Width * 0.8,
              color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          {header}
        </Text>
      </View>
    </View>
  );
}
