import React, {useContext, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function LegalPolicies({navigation}) {
  const {theme} = useContext(ThemeContext); // Get the theme context
  const isDark = theme === 'dark'; // Check if the theme is dark
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'Privacy Policies'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Introduction :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          This Privacy Policy outlines how SearchVKaro ("we" , "our","us")
          collects, uses, shares, and protects your personal information when
          you use our mobile application.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Applicability :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          This Privacy Policy applies only to information collected through the
          app and not to any third-party services linked to or accessible from
          the app.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Information We Collect :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We may collect the following types of personal and usage information:{' '}
          {'\n'}● Full Name {'\n'}● Mobile Number{'\n'}● Email Address {'\n'}●
          Profile Details {'\n'}● Product Images and Descriptions {'\n'}● Chats
          & Communication History {'\n'}● Location Data {'\n'}● Device
          Information (OS, IP Address, etc.) {'\n'}● Analytics and usage data{' '}
          {'\n'}● “OTP verification” if you’re using it for mobile signup.{' '}
          {'\n'}● Notifications or device permissions (camera, gallery) are
          used.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Use of Information :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We use the collected information to:{'\n'}● Connect buyers and sellers
          in nearby areas{'\n'}● Improve app functionality and user experience
          {'\n'}● Respond to user queries or feedback{'\n'}● Monitor and detect
          unauthorized activities{'\n'}● Conduct analytics and research{'\n'}
          dummy
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Data Sharing and Disclosure :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We do not sell or rent your personal information to third parties.
          However, we may share it: With service providers for internal
          operations If required by law or legal process In the event of a
          business transfer or acquisition
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Security :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We implement industry-standard security measures to protect your data.
          However, no digital transmission or storage system is 100% secure, so
          we cannot guarantee absolute security. We use encryption (e.g., HTTPS,
          SSL) and regular audits to secure your data.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          User Rights :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          You have the right to: Access, modify, or delete your personal data
          Withdraw consent at any time Request data portability
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Cookies and Tracking Technologies :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We may use cookies and similar tracking tools to enhance app
          performance and user experience. You can manage permissions via your
          device settings. Currently, we do not use cookies, but may introduce
          them for improving features.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Third-party Links :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          Our app may include links to third-party websites or services. We are
          not responsible for their content, terms, or privacy practices.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Dispute Handling Between Users :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          Any disputes, miscommunications, or claims between users
          (buyers/sellers) on the platform are solely their responsibility.
          SearchVKaro holds no liability and does not mediate between parties.
          We may suspend users involved in repeated or verified disputes.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Updates to This Policy :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          We may update this Privacy Policy periodically. We encourage you to
          review it each time you use the app to stay informed.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Governing Law :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          This Privacy Policy is governed by the laws of India, and any disputes
          shall be resolved under the jurisdiction of [Insert City], India.
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          User Rights :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          You have the right to: Access, modify, or delete your personal data
          Withdraw consent at any time Request data portability
        </Text>

        <Text style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          Contact Us :
        </Text>
        <Text
          style={[
            styles.description,
            {color: isDark ? '#b0b0b0' : 'rgba(0, 0, 0, 0.53)'},
          ]}>
          For privacy-related queries, contact us at:{'\n'}
          📧 Email: _____ {'\n'}
          📞 Phone: +91-XXXXXXXXXX
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, // Ensures the screen takes the full available height
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
    paddingBottom: 20, // Ensures space at the bottom for better scrolling
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
