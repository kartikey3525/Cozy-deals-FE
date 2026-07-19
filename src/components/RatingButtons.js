import React, {useContext} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import {ThemeContext} from '../context/themeContext';

const RatingButtons = ({selectedRating, onSelectRating}) => {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const ratings = [
    {label: '3.5+', value: 3.5},
    {label: '4.0', value: 4.0},
    {label: '4.5+', value: 4.5},
    {label: '5.0', value: 5.0},
    {label: 'Any', value: null},
  ];

  const handlePress = value => {
    const newRating = selectedRating === value ? null : value;
    onSelectRating(newRating);
  };

  return (
    <View style={styles.row}>
      {ratings.map(rating => {
        const isSelected = selectedRating === rating.value;
        return (
          <TouchableOpacity
            key={rating.label}
            style={[
              styles.chip,
              {borderColor: isDark ? '#333' : '#e5e5e5'},
              isSelected && styles.chipActive,
            ]}
            onPress={() => handlePress(rating.value)}>
            <Text
              style={[
                styles.chipText,
                {color: isDark ? '#fff' : '#222'},
                isSelected && styles.chipTextActive,
              ]}>
              {rating.label}
            </Text>
            {rating.value !== null && (
              <Octicons
                name="star-fill"
                size={12}
                color={isSelected ? '#00AEEF' : 'rgba(255, 190, 17, 1)'}
                style={{marginLeft: 4}}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    borderColor: '#00AEEF',
    backgroundColor: 'rgba(0, 174, 239, 0.12)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#00AEEF',
  },
});

export default RatingButtons;
