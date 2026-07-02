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
  import Entypo from 'react-native-vector-icons/Entypo';
  import {ThemeContext} from '../context/themeContext';
  import Header from '../components/Header';
  import {useIsFocused} from '@react-navigation/native';
  import { AuthContext } from '../context/authcontext';
  
  export default function ProductsList({navigation, route}) {
    const {theme} = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const {
        fullCategorydata,
        userdata,
        getSingleShop,
        singleShop,
        location,
        deleteProduct,
      } = useContext(AuthContext);
    const isFocused = useIsFocused();
  
    useEffect(() => {
        if (isFocused) {
            if (userdata?._id) {
                getSingleShop(userdata._id);
              }
        }
    }, [isFocused]);
  
    useEffect(() => {
      if (singleShop?.categoriesPost) {
        const shopProducts = singleShop.categoriesPost || [];
        setProducts(shopProducts);
        
        // Extract unique categories from products
        const allCategories = Array.from(
          new Set(shopProducts.flatMap(product => product.categories))
        );
        setCategories(allCategories);
      }
    }, [singleShop]);
  
    const handleRemoveProduct = (productId) => {
      // Alert.alert(
      //   "Remove Product",
      //   "Are you sure you want to remove this product?",
      //   [
      //     {
      //       text: "Cancel",
      //       style: "cancel"
      //     },
      //     {
      //       text: "Remove",
      //       onPress: () => {
      //           // setProducts(prev => prev.filter(p => p._id !== productId));
      //           deleteProduct(productId);
      //           getSingleShop(userdata._id);
                
      //       }
      //     }
      //   ]
      // );
    
      deleteProduct(productId);
      getSingleShop(userdata._id);
    
    };
  
    const handleProductPress = (product) => {
      navigation.navigate('AddProducts', { 
        productData: product,
        isEditMode: true 
      });
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
        <Header header={'Products List'} />
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#00AEEF" />
        ) : categories.length === 0 ? (
          <Text style={{color: isDark ? '#fff' : '#000', marginTop: 20}}>
            No products found.
          </Text>
        ) : (
          <View style={{alignSelf: 'flex-start', width: '100%'}}>
            {Object.keys(groupedProducts).map(category => (
              <View key={category} style={{marginBottom: 20, paddingHorizontal: 15}}>
                <Text style={[styles.categoryTitle, {color: isDark ? '#fff' : '#000'}]}>
                  {category}
                </Text>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingVertical: 5}}
                >
                  <View style={{flexDirection: 'row'}}>
                    {groupedProducts[category].map((product, index) => (
                      <TouchableOpacity 
                        key={product._id} 
                        onPress={() => handleProductPress(product)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.productCard}>
                          <View style={{position: 'relative'}}>
                            {product.images && product.images.length > 0 ? (
                              <Image
                                source={{uri: product.images[0]}}
                                style={[
                                  styles.productImage,
                                  {borderColor: isDark ? 'white' : 'black'},
                                ]}
                              />
                            ) : (
                              <View style={[
                                styles.productImage,
                                {borderColor: isDark ? 'white' : 'black', backgroundColor: isDark ? '#333' : '#eee'},
                              ]}>
                                <Text style={{color: isDark ? '#aaa' : '#888'}}>No Image</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              style={[
                                styles.removeButton,
                                {backgroundColor: isDark ? 'black' : 'white'}
                              ]}
                              onPress={() => handleRemoveProduct(product._id)}>
                              <Entypo name="cross" size={18} color={isDark ? 'white' : 'black'} />
                            </TouchableOpacity>
                          </View>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.productName,
                              {color: isDark ? '#fff' : '#000'},
                            ]}>
                            {product.title || 'Untitled Product'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    screen: {
      alignItems: 'center',
      paddingBottom: 20,
      minHeight: '100%',
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      marginLeft: 5,
    },
    productCard: {
      marginRight: 15,
      alignItems: 'center',
      width: 100,
    },
    productImage: {
      width: 100,
      height: 120,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    productName: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 5,
      textAlign: 'center',
      width: 80,
    },
    removeButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      borderRadius: 10,
      padding: 2,
    },
  });