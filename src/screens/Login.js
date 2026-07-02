import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { HelperText } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/authcontext';
import { ThemeContext } from '../context/themeContext';
import Entypo from 'react-native-vector-icons/Entypo';

const { width: Width, height: Height } = Dimensions.get('window');

export default function Login({ navigation }) {
  // State management
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    handleRemenberme: true,
  });
  const [isNew, setIsNew] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [loading, setLoading] = useState({
    login: false,
    register: false,
    google: false,
    forgotPassword: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null); // To determine which modal to show

  // Context hooks
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { signInWithGoogle, handleLogin, handleRegister } = useContext(AuthContext);

  // Input validation helpers
  const containsEmojis = (text) => /[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu.test(text);
  const hasLeadingOrTrailingSpace = (text) => text !== text.trim();
  const hasConsecutiveSpaces = (text) => text.includes('  ');

  // Input handlers
  const handleInputChange = (field, value) => {
    if (containsEmojis(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Emojis are not allowed' }));
      return;
    }

    if (field === 'password' && value.includes(' ')) {
      setErrors(prev => ({ ...prev, password: 'Spaces are not allowed' }));
      return;
    }

    if ((field === 'username' || field === 'email') && hasLeadingOrTrailingSpace(value)) {
      setErrors(prev => ({ ...prev, [field]: 'No leading/trailing spaces' }));
      return;
    }

    if (field === 'username' && hasConsecutiveSpaces(value)) {
      setErrors(prev => ({ ...prev, username: 'Only single spaces allowed' }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Form validation
  const validateInputs = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    const newErrors = { email: '', password: '', username: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email or phone is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.email) && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
      isValid = false;
    }

    if (isNew) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
        isValid = false;
      } else if (formData.username.length < 3) {
        newErrors.username = 'Minimum 3 characters';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Auth handlers
  const handleAuthPress = async () => {
    if (!validateInputs()) return;

    const loadingType = isNew ? 'register' : 'login';
    setLoading(prev => ({ ...prev, [loadingType]: true }));

    try {
      if (isNew) {
        await handleRegister(
          formData.email,
          formData.password,
          formData.username,
          formData.handleRemenberme
        );
      } else {
        await handleLogin(
          formData.email,
          formData.password,
          formData.handleRemenberme
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [loadingType]: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(prev => ({ ...prev, google: true }));
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', error.message || 'Google sign-in failed');
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  // Render methods
  const renderAuthButton = () => {
    const isLoading = isNew ? loading.register : loading.login;

    return (
      <TouchableOpacity
        style={[styles.blueBotton, isLoading && styles.disabledButton]}
        onPress={handleAuthPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isNew ? 'Send OTP' : 'Login'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderGoogleButton = () => (
    <TouchableOpacity
      style={[
        styles.whiteBotton,
        { backgroundColor: isDark ? '#000' : '#fff' },
        loading.google && styles.disabledButton,
      ]}
      onPress={handleGoogleSignIn}
      disabled={loading.google}
    >
      {loading.google ? (
        <ActivityIndicator color={isDark ? '#fff' : '#000'} />
      ) : (
        <>
          <Image
            source={require('../assets/Google.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          <Text style={[
            styles.socialButtonText,
            { color: isDark ? '#fff' : '#1D1E20' }
          ]}>
            Login with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  // Legal Policies Component
  const LegalPolicies = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
      <View style={[legalStyles.screen, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={legalStyles.header}>
          <Entypo
            onPress={onClose}
            name="chevron-thin-left"
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
            style={{ marginLeft: 20, padding: 5 }}
          />
          <Text
            style={[
              legalStyles.headerText,
              { color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)' },
            ]}
          >
            Privacy Policies
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={legalStyles.scrollContent}
        >
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Introduction :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            This Privacy Policy outlines how SearchVKaro ("we", "our", "us")
            collects, uses, shares, and protects your personal information when
            you use our mobile application.
          </Text>
         
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Applicability :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            This Privacy Policy applies only to information collected through the
            app and not to any third-party services linked to or accessible from
            the app.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Information We Collect :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We may collect the following types of personal and usage information:{' '}
            {'\n'}● Full Name {'\n'}● Mobile Number{'\n'}● Email Address {'\n'}●
            Profile Details {'\n'}● Product Images and Descriptions {'\n'}● Chats
            & Communication History {'\n'}● Location Data {'\n'}● Device
            Information (OS, IP Address, etc.) {'\n'}● Analytics and usage data{' '}
            {'\n'}● "OTP verification" if you're using it for mobile signup.{' '}
            {'\n'}● Notifications or device permissions (camera, gallery) are
            used.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Use of Information :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We use the collected information to:{'\n'}● Connect buyers and sellers
            in nearby areas{'\n'}● Improve app functionality and user experience
            {'\n'}● Respond to user queries or feedback{'\n'}● Monitor and detect
            unauthorized activities{'\n'}● Conduct analytics and research{'\n'}
            dummy
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Data Sharing and Disclosure :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We do not sell or rent your personal information to third parties.
            However, we may share it: With service providers for internal
            operations If required by law or legal process In the event of a
            business transfer or acquisition
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Security :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We implement industry-standard security measures to protect your data.
            However, no digital transmission or storage system is 100% secure, so
            we cannot guarantee absolute security. We use encryption (e.g., HTTPS,
            SSL) and regular audits to secure your data.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            User Rights :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            You have the right to: Access, modify, or delete your personal data
            Withdraw consent at any time Request data portability
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Cookies and Tracking Technologies :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We may use cookies and similar tracking tools to enhance app
            performance and user experience. You can manage permissions via your
            device settings. Currently, we do not use cookies, but may introduce
            them for improving features.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Third-party Links :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            Our app may include links to third-party websites or services. We are
            not responsible for their content, terms, or privacy practices.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Dispute Handling Between Users :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            Any disputes, miscommunications, or claims between users
            (buyers/sellers) on the platform are solely their responsibility.
            SearchVKaro holds no liability and does not mediate between parties.
            We may suspend users involved in repeated or verified disputes.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Updates to This Policy :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We may update this Privacy Policy periodically. We encourage you to
            review it each time you use the app to stay informed.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Governing Law :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            This Privacy Policy is governed by the laws of India, and any disputes
            shall be resolved under the jurisdiction of [Insert City], India.
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            User Rights :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            You have the right to: Access, modify, or delete your personal data
            Withdraw consent at any time Request data portability
          </Text>
  
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Contact Us :
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            For privacy-related queries, contact us at:{'\n'}
            📧 Email: _____{'\n'}
            📞 Phone: +91-XXXXXXXXXX
          </Text>
        </ScrollView>
      </View>
    );
  };

  // Terms and Conditions Component
  const TermsAndConditions = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
      <View style={[legalStyles.screen, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={legalStyles.header}>
          <Entypo
            onPress={onClose}
            name="chevron-thin-left"
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
            style={{ marginLeft: 20, padding: 5 }}
          />
          <Text
            style={[
              legalStyles.headerText,
              { color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)' },
            ]}
          >
            Terms and Conditions
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={legalStyles.scrollContent}
        >
          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            Terms and Conditions – SearchVKaro
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            Effective Date: [Insert Date]{'\n'}
            App Name: SearchVKaro{'\n'}
            App Owner: Dilip Kumar (Founder, SearchVKaro){'\n'}
            Contact Email: _____{'\n'}
            Contact Phone: +91-XXXXXXXXXX{'\n'}
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            1. Purpose
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            SearchVKaro is a location-based buyer-seller connection platform that enables users to post
            product requests and receive responses from nearby businesses or individuals. This app acts
            as a "bridge" or "platform" only — not responsible for transactions.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            2. User Eligibility
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            By accessing or using SearchVKaro, you confirm that you are at least 18 years old or have
            legal parental or guardian consent, and that you are fully competent to enter into the terms
            set forth herein. Users shall not impersonate others or provide false information. Users under
            the age of 18 may use this app only under the supervision of a parent or legal guardian.
            Violations may result in legal action if necessary.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            3. Use of the App
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            You agree to use the app only for lawful purposes and in a way that does not infringe the
            rights of others. You are strictly prohibited from:{'\n'}
            ● Uploading false, misleading, or inappropriate content{'\n'}
            ● Spamming or attempting unauthorized access to other user data{'\n'}
            ● Using automated tools (bots, scrapers, etc.) to interact with the app
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            4. User Content
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            You retain ownership of any content (images, descriptions, posts) you upload. However, by
            uploading, you grant SearchVKaro a worldwide, non-exclusive, royalty-free license to use,
            display, and distribute this content within the platform. Users are responsible for ensuring
            they have the right to upload the content they post.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            5. Chats and Communications
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            All communications between users on the platform should be respectful and non-abusive.
            Any user found violating this guideline may be suspended or banned from using the
            platform.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            6. Dispute Resolution
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            SearchVKaro acts only as a technology enabler. Any disputes or issues between buyers and
            sellers are to be handled at the discretion of the involved parties. The platform will not be
            liable or held responsible for any disagreements, damages, or losses. SearchVKaro
            encourages users to rate their experiences to improve transparency.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            7. Pricing & Fees
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            Currently, SearchVKaro is free to use. Any changes to this pricing policy will be updated and
            communicated via the app. Future monetization may include premium services, featured listings, or
            subscription-based features.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            8. Account Termination
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We reserve the right to suspend or delete your account without notice in case of a breach of
            the terms, misuse of services, or illegal activities.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            9. Limitation of Liability
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            SearchVKaro is not liable for any indirect, incidental, or consequential damages arising out
            of your use of the platform. All services and features are provided "as-is."
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            10. Modifications
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            We may update or change these Terms & Conditions from time to time. Continued use of the
            platform means you accept those changes.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            11. Governing Law
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            These terms are governed by and interpreted in accordance with the laws of India. Disputes
            shall be subject to the jurisdiction of the courts in [Insert City], India.
          </Text>

          <Text style={[legalStyles.title, { color: isDark ? '#fff' : '#000' }]}>
            12. Contact Us
          </Text>
          <Text
            style={[
              legalStyles.description,
              { color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)' },
            ]}
          >
            For questions regarding these terms, contact:{'\n'}
            📧 Email: _____{'\n'}
            📞 Phone: +91-XXXXXXXXXX
          </Text>
        </ScrollView>
      </View>
    );
  };

  // Legal Styles
  const legalStyles = StyleSheet.create({
    screen: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      height: Height * 0.1,
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      width: Width * 0.8,
      textAlign: 'center',
    },
    scrollContent: {
      paddingBottom: 20,
      paddingHorizontal: 25,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
    description: {
      fontSize: 16,
      fontWeight: '400',
      marginTop: 6,
    },
  });

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.screen,
          { backgroundColor: isDark ? 'black' : 'white' },
        ]}
      >
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={[styles.bigText, { color: isDark ? '#fff' : '#000' }]}>
          {isNew ? 'Create an account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.smallText, { marginBottom: 30, color: isDark ? '#ccc' : '#000' }]}>
          {isNew ? 'Create your account using email or social networks' : 'Log in to your account using email or social networks'}
        </Text>

        {/* Username Field (only for registration) */}
        {isNew && (
          <>
            <View style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#000' : '#fff' },
            ]}>
              <TextInput
                value={formData.username}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#000' : '#fff',
                    color: isDark ? '#fff' : '#000',
                  },
                ]}
                onChangeText={(text) => handleInputChange('username', text)}
                placeholder="Username"
                placeholderTextColor={isDark ? 'white' : 'black'}
                autoCapitalize="none"
              />
            </View>
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>
          </>
        )}

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <TextInput
            value={formData.email}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : '#fff',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="Email"
            placeholderTextColor={isDark ? 'white' : 'black'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <HelperText type="error" visible={!!errors.email} style={styles.errorText}>
          {errors.email}
        </HelperText>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <TextInput
            value={formData.password}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : '#fff',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Password"
            secureTextEntry={!showPassword}
            placeholderTextColor={isDark ? 'white' : 'black'}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={isDark ? 'white' : 'black'}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>
        <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
          {errors.password}
        </HelperText>

        {/* Remember Me & Forgot Password */}
        <Pressable
          onPress={() => handleInputChange('handleRemenberme', !formData.handleRemenberme)}
          style={styles.rememberMeContainer}
        >
          <Ionicons
            name={formData.handleRemenberme ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={formData.handleRemenberme ? '#43E2F3' : '#949090'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.rememberMeText, { color: isDark ? '#fff' : '#B2BACD' }]}>
            Remember me
          </Text>
          {!isNew && (
            <Text
              onPress={() => navigation.navigate('forgetpassword')}
              style={[styles.forgotPasswordText, { color: '#43E2F3' }]}
            >
              Forgot Password?
            </Text>
          )}
        </Pressable>

        {/* Auth Button */}
        {renderAuthButton()}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign-In */}
        {renderGoogleButton()}

        {/* Toggle between Login/Register */}
        <Text style={[styles.toggleAuthText, { color: isDark ? '#B2BACD' : '#1D1E20' }]}>
          {isNew ? 'Already have an account?' : "Don't have an account?"}
          <Text
            onPress={() => setIsNew(!isNew)}
            style={{ color: '#43E2F3' }}
          >
            {isNew ? ' Login' : ' Sign up'}
          </Text>
        </Text>

        {/* Terms & Conditions and Privacy Policy Links */}
        <Text style={[styles.termsText, { color: isDark ? '#B2BACD' : '#1D1E20' }]}>
          By signing up you agree to our{' '}
          <Text
            style={{ color: '#43E2F3' }}
            onPress={() => {
              setModalContent('terms');
              setModalVisible(true);
            }}
          >
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text
            style={{ color: '#43E2F3' }}
            onPress={() => {
              setModalContent('privacy');
              setModalVisible(true);
            }}
          >
            Privacy Policy
          </Text>
        </Text>
      </ScrollView>

      {/* Modal for Legal Content */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {modalContent === 'terms' ? (
          <TermsAndConditions onClose={() => setModalVisible(false)} />
        ) : (
          <LegalPolicies onClose={() => setModalVisible(false)} />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: Width,
    alignItems: 'center',
    paddingTop: '15%',
    paddingBottom: '30%',
  },
  errorText: {
    width: Width * 0.95,
    textAlign: 'left',
    marginBottom: 1,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#A3A3A3',
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  textInput: {
    borderRadius: 10,
    width: '86%',
    height: Height * 0.06,
    padding: 10,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    width: 250,
    marginBottom: 10,
  },
  bigText: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '90%',
    height: Height * 0.06,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBotton: {
    width: '90%',
    height: Height * 0.06,
    borderRadius: 10,
    margin: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '400',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 15,
  },
  rememberMeText: {
    fontSize: 15,
    width: Width * 0.48,
  },
  forgotPasswordText: {
    fontSize: 15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3A3A3',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#9DA49E',
  },
  toggleAuthText: {
    fontSize: 15,
    marginVertical: 10,
  },
  termsText: {
    fontSize: 15,
    margin: 20,
    textAlign: 'center',
  },
});