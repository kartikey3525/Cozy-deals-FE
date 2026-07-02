import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {Rating} from '@kolking/react-native-rating';
import {ThemeContext} from '../context/themeContext';

export default function RatingTest({fixedRating}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <Rating
        size={14}
        rating={fixedRating}
        starColor="rgba(255, 219, 17, 1)" // Gold for selected stars
        baseColor={isDark ? '#48484A' : '#D1D1D6'} // White in light mode, Black in dark mode
        disabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
});
