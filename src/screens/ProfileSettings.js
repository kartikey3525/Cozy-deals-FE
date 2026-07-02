import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {HelperText} from 'react-native-paper';
import {AuthContext} from '../context/authcontext';
import {Dimensions} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useIsFocused} from '@react-navigation/native';
import {ThemeContext} from '../context/themeContext';
import DatePicker from 'react-native-date-picker';
import Header from '../components/Header';
import useImagePicker from '../hooks/useImagePicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: Width, height: Height} = Dimensions.get('window');

export default function ProfileSettings({navigation, route}) {
  // Context and theme
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // State
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [shopData, setshopData] = useState(false);

  const [errors, setErrors] = useState({
    phone: '',
    location: '',
    media: '',
    categories: '',
    name: '',
  });

  // Refs
  const phoneInput = useRef(null);
  const isFocused = useIsFocused();

  // Custom hooks
  const {media, selectMedia, isUploading, setMedia} = useImagePicker();
  {
    isUploading && <ActivityIndicator size="large" color="#0000ff" />;
  }
  // Context data
  const {
    getCategories,
    userRole,
    getUserData,
    Userfulldata,
    userdata,
    getSingleShop,
    singleShop,
    location,
  } = useContext(AuthContext);

  // Memoized styles
  const dynamicStyles = {
    screen: {
      backgroundColor: isDark ? '#000' : '#fff',
    },
    textColor: {
      color: isDark ? '#fff' : '#000',
    },
    borderColor: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    modalContent: {
      backgroundColor: isDark ? '#121212' : '#fff',
    },
    iconColor: {
      color: isDark ? '#fff' : 'rgb(0, 0, 0)',
    },
  };

  // Data fetching
  useEffect(() => {
    getCategories();
    // getUserData();
  }, [isFocused]);

  useEffect(() => {
    // getUserData();
    setshopData(Userfulldata);
  }, [userdata?._id, isFocused]);

  // Set media when singleShop changes
  useEffect(() => {
    if (shopData?.profile) {
      setMedia(Array.isArray(shopData.profile) ? shopData.profile : []);
    }
  }, [shopData?.profile]);

  const handleEditPress = useCallback(() => {
    navigation.navigate(userRole === 'buyer' ? 'editProfile' : 'Sellerprofile');
  }, [userRole]);

  const handleRemovePhoto = useCallback(() => {
    if (media.length > 0) {
      setMedia(media.slice(1));
    }
    setModalVisible1(false);
  }, [media]);

  // Render functions
  const renderProfileImage = useCallback(() => {
    const source =
      media.length > 0 && media[0]
        ? {uri: media[0]}
        : shopData?.profile?.length > 0
        ? {uri: shopData.profile[0]}
        : require('../assets/User-image.png');

    return (
      <Pressable onPress={() => setModalVisible(true)}>
        <Image
          source={source}
          style={[
            styles.profileImage,
            {
              borderColor: isDark
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(231, 231, 231, 1)',
            },
          ]}
        />
        {/* <Pressable onPress={() => setModalVisible1(true)} style={styles.editButton}>
          <Image
            source={require('../assets/edit.png')}
            style={styles.editIcon}
            resizeMode="contain"
          />
        </Pressable> */}
      </Pressable>
    );
  }, [media, shopData?.profile, isDark]);

  const renderUserInfo = useCallback(
    () => (
      <View style={styles.userInfoContainer}>
        <Text style={[styles.userName, dynamicStyles.textColor]}>
          {shopData?.name}
        </Text>
        <Text style={[styles.userEmail, dynamicStyles.textColor]}>
          {shopData?.email}
        </Text>
      </View>
    ),
    [shopData, dynamicStyles],
  );

  const formatDOB_DDMMYYYY = dateStr => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderShopInfoSection = useCallback(
    () => (
      <View style={[styles.shopInfoContainer, {}]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, dynamicStyles.textColor]}>
            Details
          </Text>
          <Pressable onPress={handleEditPress}>
            <Image
              source={
                isDark
                  ? require('../assets/edit1-dark.png')
                  : require('../assets/edit1.png')
              }
              style={styles.editProfileIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={[styles.divider, dynamicStyles.borderColor]} />
        <>
          {renderInfoRow('Name', shopData?.name)}
          {renderInfoRow('Contact', shopData?.phone)}
          {renderInfoRow('Email Address', shopData?.email)}
        </>

        {userdata?.roleId === 0 && (
          <>
            {renderInfoRow('DOB', formatDOB_DDMMYYYY(Userfulldata?.dob))}
            {renderInfoRow('Gender', shopData?.gender)}
          </>
        )}
      </View>
    ),
    [shopData, isDark, handleEditPress, dynamicStyles],
  );

  const renderBusinessDetailsSection = useCallback(
    () => (
      <View style={styles.businessDetailsContainer}>
        {userdata?.roleId === 1 && (
          <>
            <View style={[styles.divider, dynamicStyles.borderColor]} />

            <Text
              style={[
                styles.sectionTitle,
                dynamicStyles.textColor,
                {marginLeft: 15},
              ]}>
              Business Statutory Details
            </Text>
            <View style={[styles.divider, dynamicStyles.borderColor]} />
            {renderInfoRow('Shop name', shopData?.shopName)}
            {renderInfoRow('Owner name', shopData?.ownerName)}
            {renderInfoRow('Average rating', shopData?.averageRating)}


            {renderInfoRow(
              'Year of Establishment',
              shopData?.establishmentYear,
            )}
            {renderInfoRow(
              'Delivery Available',
              shopData?.isDeliveryAvailable === 'true' ? 'Yes' : 'No',
            )}
            {renderInfoRow('Open at', shopData?.openTime)}
            {renderInfoRow('Close at', shopData?.closeTime)}
            {renderInfoRow('Social Media', shopData?.socialMedia)}
            {renderInfoRow('Business Scale', shopData?.businessScale, true)}
            {renderInfoRow('GSTIN', shopData?.gstin)}
            {renderInfoRow(
              'Categories',
              shopData?.selectedCategories?.join(', '),
              true,
            )}
            {renderInfoRow(
              'Location',
              location&& `Lat: ${location.latitude}, Long: ${location.longitude}`,
              true,
            )}
            {renderInfoRow('Shop About', shopData?.description, true)}
          </>
        )}
      </View>
    ),
    [shopData, dynamicStyles],
  );

  const renderInfoRow = (label, value, multiline = false) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, dynamicStyles.textColor]}>{label}</Text>
      <Text
        style={styles.infoValue}
        numberOfLines={multiline ? 2 : 1}
        ellipsizeMode={multiline ? 'tail' : 'clip'}>
        {value || 'Not provided'}
      </Text>
    </View>
  );

  const renderShopImages = useCallback(
    () =>
      media.length > 0 &&
      userdata?.roleId === 1 && (
        <>
          <View style={[styles.divider, dynamicStyles.borderColor]} />

          <Text style={[styles.shopImagesTitle, dynamicStyles.textColor]}>
            Photos
          </Text>
          <View style={[styles.divider, dynamicStyles.borderColor]} />

          <View style={styles.imageContainer}>
            {media.slice(1, 8).map((item, index) => (
              <View key={`image-${index}`} style={styles.mediaItem}>
                <Image source={{uri: item}} style={styles.mediaPreview} />
              </View>
            ))}
          </View>
        </>
      ),
    [media, dynamicStyles],
  );

  const renderImageModal = useCallback(
    () => (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}>
            <Image
              source={
                media.length > 0 && media[0]
                  ? {uri: media[0]}
                  : Userfulldata?.profile?.length > 0
                  ? {uri: Userfulldata.profile[0]}
                  : require('../assets/User-image.png')
              }
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </Pressable>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}>
            <Entypo name="cross" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    ),
    [modalVisible, media, Userfulldata?.profile],
  );

  // const renderEditPhotoModal = useCallback(() => (
  //   <Modal visible={modalVisible1} transparent={true}>
  //     <Pressable
  //       style={[
  //         styles.modalOverlay,
  //         {
  //           backgroundColor: isDark
  //             ? 'rgba(255, 255, 255, 0.19)'
  //             : 'rgba(0, 0, 0, 0.3)',
  //         },
  //       ]}
  //       onPress={() => setModalVisible1(false)}>
  //       <View style={[styles.editModalContent, dynamicStyles.modalContent]}>
  //         <View style={styles.modalHandle} />
  //         <TouchableOpacity
  //           style={[
  //             styles.closeButton,
  //             {backgroundColor: isDark ? 'rgba(36, 36, 36, 1)' : 'lightgrey'},
  //           ]}
  //           onPress={() => setModalVisible1(false)}>
  //           <Entypo name="cross" size={22} color={isDark ? '#fff' : 'black'} />
  //         </TouchableOpacity>

  //         {renderModalOption('Take Photo', 'camera', requestCameraPermission)}
  //         {renderModalOption('Choose from Gallery', 'image', selectMedia)}
  //         {renderModalOption('Remove Current Photo', 'trash', handleRemovePhoto, true)}
  //       </View>
  //     </Pressable>
  //   </Modal>
  // ), [modalVisible1, isDark, dynamicStyles, handleRemovePhoto]);

  const renderModalOption = (
    text,
    iconName,
    onPress,
    isDestructive = false,
  ) => (
    <TouchableOpacity
      style={[styles.modalOption, dynamicStyles.borderColor]}
      onPress={onPress}>
      {iconName === 'image' ? (
        <MaterialCommunityIcons
          name={iconName}
          size={28}
          color={
            isDestructive ? 'rgb(255, 0, 0)' : dynamicStyles.iconColor.color
          }
          style={styles.modalOptionIcon}
        />
      ) : (
        <Entypo
          name={iconName}
          size={22}
          color={
            isDestructive ? 'rgb(255, 0, 0)' : dynamicStyles.iconColor.color
          }
          style={styles.modalOptionIcon}
        />
      )}
      <Text
        style={[
          styles.modalOptionText,
          isDestructive && {color: 'rgb(255, 0, 0)'},
          !isDestructive && dynamicStyles.textColor,
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        dynamicStyles.screen,
        {height: userdata.roleId !== 1 && Height},
      ]}>
      {/* <Header header={'Profile'} /> */}

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
            onPress={() => navigation.navigate('Profilescreen')}
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
            Profile
          </Text>
        </View>
      </View>

      <View style={styles.profileHeader}>
        {renderProfileImage()}
        {renderUserInfo()}
      </View>

      <HelperText type="error" visible={!!errors.media} style={{color: 'red'}}>
        {errors.media}
      </HelperText>

      <View style={styles.contentContainer}>
        {renderShopInfoSection()}
        {renderBusinessDetailsSection()}
        {renderShopImages()}
      </View>

      {renderImageModal()}
      {/* {renderEditPhotoModal()} */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    // flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    overflow: 'hidden',
    marginBottom: 5,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 100,
    top: 10,
    borderWidth: 5,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  editIcon: {
    width: 40,
    height: 30,
  },
  userInfoContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  userName: {
    fontSize: 15,
    width: 200,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
  },
  userEmail: {
    alignSelf: 'center',
    textAlign: 'center',
  },
  contentContainer: {
    borderWidth: 1,
    marginBottom: 60,
    borderColor: 'rgb(108, 108, 108)',
    borderRadius: 10,
    width: '90%',
    paddingTop: 20,
  },
  sectionHeader: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionTitle: {
    fontWeight: '400',
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
    width: '78%',
  },
  editProfileIcon: {
    width: 40,
    height: 18,
    alignSelf: 'flex-end',
  },
  divider: {
    borderWidth: 0.3,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 20,
  },
  infoLabel: {
    fontWeight: '400',
    fontSize: 15,
    marginLeft: 20,
    marginBottom: 5,
  },
  infoValue: {
    color: 'grey',
    fontWeight: '400',
    fontSize: 15,
    marginLeft: 20,
  },
  businessDetailsContainer: {
    marginTop: 10,
  },
  shopImagesTitle: {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: '600',
    marginLeft: '7%',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '95%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  mediaItem: {
    width: '20%',
    margin: '2%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '90%',
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editModalContent: {
    width: '100%',
    height: Height * 0.26,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  modalHandle: {
    height: 5,
    backgroundColor: 'lightgrey',
    width: 60,
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 10,
    top: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 30,
    borderRadius: 15,
    padding: 1,
  },
  modalOption: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    height: 50,
    padding: 10,
  },
  modalOptionIcon: {
    marginRight: 15,
    marginLeft: 20,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 6,
  },
});
