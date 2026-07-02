import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {HelperText} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {AuthContext} from '../context/authcontext';
import {Dimensions} from 'react-native';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';
import useImagePicker1 from '../hooks/useImagePicker1';
import {TextInput} from 'react-native';
import Dropdown from '../components/Dropdown';
import {useIsFocused} from '@react-navigation/native';

export default function AddProducts({navigation, route}) {
  const {productData, isEditMode, isShowMode} = route.params || {};
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading2, setIsLoading2] = useState(false);
  const [errors, setErrors] = useState({
    media: '',
    name: '',
    category: '',
    products: '',
  });
  const [dropdownKey, setDropdownKey] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    getCategories,
    fullCategorydata,
    createSellerProducts,
    updateProduct,
    Userfulldata,
  } = useContext(AuthContext);
  const {media, selectMedia, setMedia, isLoading} = useImagePicker1();
  const isFocused = useIsFocused();

  const filteredResults = fullCategorydata.filter(item =>
    Userfulldata?.selectedCategories?.map(c => c).includes(item?.name),
  );
  // Check for shopName on screen focus
  useEffect(() => {
    if (isFocused) {
      // console.log('Userfulldata', Userfulldata?.selectedCategories)

      // const filteredResults = fullCategorydata.filter(
      //   item =>
      //     Userfulldata?.selectedCategories?.map(c => c).includes(
      //       item?.name
      //     )
      // );

      // console.log('filteredResults',filteredResults[0].subCategories[0].name)
      if (!Userfulldata?.shopName && !isShowMode) {
        Alert.alert(
          'Shop Details Required',
          'Please fill your shop details first , before adding a product.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Sellerprofile'),
            },
          ],
          {cancelable: false},
        );
      }
    }
  }, [isFocused, Userfulldata, navigation]);

  useEffect(() => {
    getCategories();

    // Initialize form with product data if in edit mode
    if (isEditMode && productData) {
      setName(productData.title || '');
      setSelectedCategories(productData.categories || []);
      setMedia(productData.images?.[0] || null);
    }
    if (isShowMode && productData) {
      setName(productData.title || '');
      setSelectedCategories(productData.categories || []);
      setMedia(productData.images?.[0] || null);
    }
    
  }, [isFocused]);

  useEffect(() => {
    // If we're editing an existing product in the list
    if (editingIndex !== null && products[editingIndex]) {
      const product = products[editingIndex];
      setName(product.title || '');
      setSelectedCategories(product.categories || []);
      setMedia(product.images?.[0] || null);
    }
  }, [editingIndex]);

  const handleCategoryChange = value => {
    setSelectedCategories(value);
    if (value.length > 0) {
      setErrors(prev => ({...prev, category: ''}));
    }
  };

  const validateInputs = () => {
    if (isEditMode) {
      return true;
    }

    const newErrors = {
      products:
        products.length === 0
          ? 'Please add at least one product before submitting.'
          : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handlePress = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading2(true);
      if (isEditMode && productData) {
        await updateProduct(productData, name, media, selectedCategories);
      } else {
        await createSellerProducts(products);
        Alert.alert('Success', 'Products added successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading2(false);
    }
  };

  const handleAddProduct = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrors(prev => ({...prev, name: 'Please enter product name'}));
      return;
    }

    if (!media) {
      setErrors(prev => ({...prev, media: 'Please select an image'}));
      return;
    }

    if (selectedCategories.length === 0) {
      setErrors(prev => ({
        ...prev,
        category: 'Please select at least one category',
      }));
      return;
    }

    const newProduct = {
      title: trimmedName,
      images: [media],
      categories: selectedCategories,
    };

    if (editingIndex !== null) {
      setProducts(prev => {
        const updated = [...prev];
        updated[editingIndex] = newProduct;
        return updated;
      });
      setEditingIndex(null);
    } else {
      setProducts(prev => [...prev, newProduct]);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setMedia(null);
    setSelectedCategories([]);
    setErrors({media: '', name: '', category: '', products: ''});
    setDropdownKey(prev => prev + 1);
  };

  const handleRemoveProduct = (category, index) => {
    Alert.alert(
      'Remove Product',
      'Are you sure you want to remove this product?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          onPress: () => {
            setProducts(prev => {
              const updated = [...prev];
              updated.splice(index, 1);
              return updated;
            });
          },
        },
      ],
    );
  };

  const handleEditProduct = (category, index) => {
    const productIndex = products.findIndex(
      p =>
        p.categories.includes(category) &&
        p.title === groupedProducts[category][index].title,
    );

    if (productIndex !== -1) {
      setEditingIndex(productIndex);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    product.categories.forEach(category => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
    });
    return acc;
  }, {});

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#FFFFFF'},
      ]}>
      <Header header={isEditMode ? 'Edit Product' :isShowMode ? 'Product Details' : 'Add Product'} />

      <Text
        style={[
          styles.title,
          {color: isDark ? '#E0E0E0' : 'rgba(33, 33, 33, 1)'},
        ]}>
        {isEditMode ? 'Update Your Picture' : 'Upload Your Picture'}
      </Text>

      {/* Image Selector */}
      <View>
        {media ? (
          <>
            <Image
              source={{uri: media}}
              style={[styles.mediaSelector, {borderWidth: 0}]}
            />
           {!isShowMode &&( <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMedia(null)}>
              <Entypo name="cross" size={25} color={'black'} />
            </TouchableOpacity>)}
          </>
        ) : (
          <TouchableOpacity onPress={selectMedia}>
            <View
              style={[
                styles.mediaSelector,
                {
                  backgroundColor: isDark
                    ? '#1E1E1E'
                    : 'rgba(250, 250, 250, 1)',
                },
              ]}>
              <MaterialIcons name="image" size={45} color="grey" />
              <Text
                style={{
                  color: isDark ? '#BBB' : 'rgba(158, 158, 158, 1)',
                  fontWeight: 'bold',
                }}>
                Select Media
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <HelperText type="error" visible={!!errors.media}>
        {errors.media}
      </HelperText>

      {/* Name Input */}
      <View style={{alignSelf: 'flex-start', marginLeft: 25}}>
        <Text
          style={{
            color: isDark ? '#fff' : '#000',
            fontWeight: '600',
            fontSize: 15,
            marginBottom: 5,
          }}>
          Name
        </Text>
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: errors.name
              ? 'red'
              : isDark
              ? 'rgba(109, 109, 109, 0.43)'
              : 'rgba(109, 109, 109, 0.43)',
          },
        ]}>
        <TextInput
          value={name}
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? '#000' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          onChangeText={text => {
            setName(text);
            if (text) setErrors(prev => ({...prev, name: ''}));
          }}
          placeholder="Product Name"
          placeholderTextColor={isDark ? '#ccc' : 'black'}
        />
      </View>
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      {/* Category Dropdown */}
      <View style={{alignSelf: 'flex-start', marginLeft: 25}}>
        <Text
          style={{
            color: isDark ? '#fff' : '#000',
            fontWeight: '600',
            fontSize: 15,
            marginBottom: 5,
          }}>
          Category
        </Text>
      </View>
      <Dropdown
        key={`dropdown-${dropdownKey}`}
        item={filteredResults
          .flatMap(result => result.subCategories || []) // Flatten all subCategories arrays
          .map(category => ({
            label:
              category.name.charAt(0).toUpperCase() + category.name.slice(1) ||
              'Unnamed',
            value:
              category.name.charAt(0).toUpperCase() + category.name.slice(1) ||
              '',
          }))}
        placeholder={
          selectedCategories.length > 0
            ? selectedCategories.join(', ')
            : 'Select Categories'
        }
        selectedValues={selectedCategories}
        onChangeValue={handleCategoryChange}
        isMultiSelect
      />
      <HelperText type="error" visible={!!errors.category}>
        {errors.category}
      </HelperText>

      {/* Sticky Add Button */}
      {!isEditMode &&!isShowMode &&   (
        <View
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            alignSelf: 'flex-end',
            marginRight: '5%',
          }}>
          <TouchableOpacity
            style={{
              width: Width * 0.15,
              borderRadius: 20,
              borderColor: 'rgba(6, 196, 217, 1)',
              borderWidth: 1,
              alignItems: 'center',
              paddingVertical: 4,
            }}
            onPress={handleAddProduct}>
            <Text
              style={[
                styles.buttonText,
                {
                  color: 'rgba(6, 196, 217, 1)',
                  fontSize: 38,
                },
              ]}>
              {editingIndex !== null ? 'Update' : '+'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Display Products (only if products exist) */}
      {!isEditMode && products.length > 0 && (
        <View style={{maxHeight: 260, alignSelf: 'flex-start'}}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            {Object.keys(groupedProducts).map(category => (
              <View
                key={category}
                style={{
                  marginBottom: 10,
                  alignSelf: 'flex-start',
                  width: '100%',
                  paddingLeft: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: isDark ? '#fff' : 'rgb(0, 0, 0)',
                    marginBottom: 5,
                  }}>
                  {category}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {groupedProducts[category].map((product, index) => (
                      <View
                        key={index}
                        style={{padding: 6, borderRadius: 5, marginRight: 5}}>
                        <View style={{position: 'relative'}}>
                          <TouchableOpacity
                            onPress={() => handleEditProduct(category, index)}>
                            <Image
                              source={{uri: product.images?.[0]}}
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: isDark ? 'white' : 'black',
                              }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: -5,
                              right: 8,
                              backgroundColor: isDark ? 'black' : 'white',
                              borderRadius: 10,
                              padding: 2,
                            }}
                            onPress={() =>
                              handleRemoveProduct(category, index)
                            }>
                            <Entypo
                              name="cross"
                              size={18}
                              color={isDark ? 'white' : 'black'}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            width: 80,
                            color: isDark ? '#fff' : 'rgb(0, 0, 0)',
                            marginTop: 5,
                          }}>
                          {product.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <HelperText
        type="error"
        visible={!!errors.products}
        style={{alignSelf: 'center', marginTop: 10}}>
        {errors.products}
      </HelperText>

     {!isShowMode &&(   <TouchableOpacity
        style={[styles.blueButton, {margin: '20%'}]}
        onPress={handlePress}
        disabled={isLoading2}>
        <Text style={[styles.buttonText, {color: '#fff'}]}>
          {isLoading2 ? (
            <ActivityIndicator color="#fff" />
          ) : isEditMode ? (
            'Update Product'
          ) : (
            'Submit Products'
          )}
        </Text>
      </TouchableOpacity>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: 'rgba(231, 231, 231, 1)',
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    color: '#000',
    width: '86%',
    height: 50,
    padding: 10,
    margin: 4,
  },
  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 15,
    padding: 1,
  },
  mediaSelector: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Width * 0.85,
    height: 200,
    borderWidth: 2,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    borderRadius: 15,
    borderColor: 'rgba(6, 196, 217, 1)',
    marginBottom: 10,
  },
  screen: {
    alignItems: 'center',
    // flex: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 20,
  },
  blueButton: {
    backgroundColor: 'rgba(6, 196, 217, 1)',
    borderRadius: 6,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
