import React, { useContext, useState } from 'react';
import { View, TextInput, Image, StyleSheet, Dimensions } from 'react-native';
import { ThemeContext } from '../context/themeContext';

const Width = Dimensions.get('window').width;

const SearchBar = ({ placeholder, lists = [], setFilteredLists, searchKey, onFocus }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [searchText, setSearchText] = useState('');

  const getNestedValue = (obj, keyPath) => {
    if (!obj || typeof obj !== 'object') return '';
    const keys = keyPath.split('.');
    return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj) || '';
  };

  const searchFilterFunction = text => {
    setSearchText(text);

    if (typeof setFilteredLists !== 'function') {
      console.error('setFilteredLists is not a function. Check parent component.');
      return;
    }

    if (!Array.isArray(lists)) {
      console.error('lists must be an array:', lists);
      return;
    }

    if (text.trim() === '') {
      console.log('🔍 Search cleared, resetting to original lists:', lists.length);
      setFilteredLists(lists);
      return;
    }

    const lowerCaseText = text.toLowerCase();
    const isSingleList = !lists.every(item => Array.isArray(item));

    if (isSingleList) {
      const filteredResults = lists.filter(item => {
        const value = getNestedValue(item, searchKey);
        const matches = value.toLowerCase().includes(lowerCaseText);
        console.log(`🔍 Filtering item: ${value}, matches: ${matches}`);
        return matches;
      });
      console.log('🔍 Filtered single list:', filteredResults.length);
      setFilteredLists(filteredResults);
    } else {
      const filteredResults = lists.map(list =>
        list.filter(item => {
          const value = getNestedValue(item, searchKey);
          return value.toLowerCase().includes(lowerCaseText);
        }),
      );
      console.log('🔍 Filtered nested list:', filteredResults);
      setFilteredLists(filteredResults);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? '#000' : '#fff',
            borderColor: isDark ? 'rgba(94, 95, 96, 1)' : 'rgb(0, 0, 0)',
          },
        ]}>
        <Image
          source={require('../assets/search-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
          placeholderTextColor={'rgba(94, 95, 96, 1)'}
          placeholder={placeholder}
          autoCapitalize="none"
          onChangeText={searchFilterFunction}
          onFocus={onFocus}
          autoCorrect={false}
          value={searchText}
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 45,
    padding: 1,
  },
  icon: {
    width: 20,
    height: 20,
    alignSelf: 'center',
    left: 10,
  },
  searchInput: {
    width: Width * 0.85,
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '500',
    height: 45,
    left: 16,
  },
});