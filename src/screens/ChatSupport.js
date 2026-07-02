import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet, 
  Image,
  Dimensions, 
  TextInput,
  FlatList,
} from 'react-native'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
const socket = io('http://YOUR_SERVER_IP:5000');

export default function ChatSupport({navigation}) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [recentPostList, setRecentPostList] = useState([
    {
      id: 1,
      title: 'Lindsey Culhane requested ?',
      img: require('../assets/User-image.png'),
      description:
        'To manage notifications, go to  Settings,  select Notification Settings,  and customize your preferences.',
    },
    {
      id: 2,
      title: 'Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      description: '9:00 am',
    },
    {
      id: 3,
      title: 'Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      description: '9:00 am',
    },
  ]);

  const toggleDescription = itemId => {
    setSelectedItemId(prevItemId => (prevItemId === itemId ? null : itemId));
  };

  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {chatId, userId} = 'id';
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    socket.emit('joinRoom', {userId, chatId});

    socket.on('receiveMessage', newMessage => {
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const toggleModal = id => {
    if (selectedItemId === id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(id);
    }
  };

  const sendMessage = () => {
    if (text.trim() || image) {
      const newMessage = {
        id: Date.now(),
        text,
        image,
        senderId: userId,
      };
  
      // Send user's message
      socket.emit('sendMessage', { chatId, ...newMessage });
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
  
      // Clear input
      setText('');
      setImage(null);
  
      // Send a dummy response after 1 second
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: "hello ! how are you :)",
          image: null,
          senderId: "bot",
        };
        setMessages((prevMessages) => [botResponse, ...prevMessages]);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingContainer>
      <View
        style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
        <Header header={'Chat Support'} />

        {/* Chat Messages List */}
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            inverted
            keyExtractor={item => item.id.toString()}
            renderItem={({item, index}) => {
              const isSentByUser = item.senderId === userId;

              return (
                <View
                  style={[
                    styles.messageRow,
                    isSentByUser ? styles.sentRow : styles.receivedRow,
                  ]}>
                  {/* Profile Picture and Message */}
                  {!isSentByUser && index === 0 && (
                    <Image
                      source={require('../assets/user-male.png')}
                      style={styles.profileImage}
                    />
                  )}

                  <View
                    style={[
                      styles.messageContainer,
                      isSentByUser
                        ? styles.sentMessage
                        : styles.receivedMessage,
                    ]}>
                    {item.text && (
                      <Text
                        style={[
                          styles.message,
                          {color: isDark ? '#fff' : '#000'},
                        ]}>
                        {item.text}
                      </Text>
                    )}
                    {item.image && (
                      <Image source={{uri: item.image}} style={styles.image} />
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: isDark ? '#121212' : '#fff'},
          ]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.51)' : '#000'}
            style={[styles.searchInput, {color: isDark ? '#fff' : '#000'}]}
            placeholder="Write your message"
          />
          <FontAwesome
            name={'paperclip'}
            size={22}
            color={isDark ? 'rgba(255, 255, 255, 0.46)' : 'rgba(0, 0, 0, 0.46)'}
            style={{padding: 5}}
          />
          <Ionicons
            onPress={sendMessage}
            name={'send'}
            size={20}
            color="rgba(0, 174, 239, 1)"
            style={{padding: 5}}
          />
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
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
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Width * 0.9,
    elevation: 5,
    borderRadius: 40,
    alignSelf: 'center',
    height: 50,
    padding: 1,
    marginBottom: 10,
  },
  searchInput: {
    width: '80%',
    fontSize: 15,
    fontWeight: '500',
    height: 45,
    left: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  sentRow: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  receivedRow: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  sentMessage: {
    borderTopRightRadius: 0,
    backgroundColor: 'rgba(10, 190, 255, 1)',
  },
  receivedMessage: {
    borderBottomLeftRadius: 0,
    backgroundColor: 'rgba(6, 196, 217, 0.41)',
  },
  message: {
    fontSize: 16,
    color: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
});
