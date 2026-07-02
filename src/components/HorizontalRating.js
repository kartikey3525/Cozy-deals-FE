import React, {useContext, useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import {ThemeContext} from '../context/themeContext';

const HorizontalRatingButtons = ({ratings}) => {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [selectedRating, setSelectedRating] = useState(null); // State for selected rating

  const handlePress = value => {
    // Toggle the selected rating or unselect if already selected
    setSelectedRating(selectedRating === value ? null : value);
  };

  return (
    <View
      style={[styles.container, {backgroundColor: isDark ? 'black' : 'white'}]}>
      {ratings.map((rating, index) => (
        <TouchableOpacity
          disabled
          key={index}
          style={[
            styles.button,
            selectedRating === rating.value && styles.selectedButton,
            ,
            {backgroundColor: isDark ? 'black' : 'white'},
          ]}
          onPress={() => handlePress(rating.value)}>
          <Text
            style={[
              styles.text,
              selectedRating === rating.value && styles.selectedText,
              {color: isDark ? 'white' : 'black'},
            ]}>
            {rating.label}
          </Text>
          <Octicons
            name="star-fill"
            size={20}
            color={
              selectedRating === rating.value
                ? 'white'
                : 'rgba(255, 219, 17, 1)'
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 15,
    margin: 5,
    flexDirection: 'row', // Ensures horizontal layout
    justifyContent: 'flex-start', // Aligns items to the start
    alignItems: 'center', // Vertically center the items
  },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    flexDirection: 'row',
    borderColor: 'rgba(228, 228, 228, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Adjust the spacing between buttons
    backgroundColor: 'white', // Default background
  },
  selectedButton: {
    backgroundColor: 'rgba(6, 196, 217, 1)', // Highlighted background
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
    color: 'black', // Default text color
  },
  selectedText: {
    color: 'rgba(255, 255, 255, 1)', // Highlighted text color
  },
});

export default HorizontalRatingButtons;
