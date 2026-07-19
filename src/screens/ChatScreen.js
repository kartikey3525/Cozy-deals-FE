import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;

const ChatScreen = ({navigation, route}) => {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {apiURL, userdata, socket} = useContext(AuthContext);
  const {item} = route.params;
  const userId = userdata._id;
  const recipientId = item._id;
  const userToken = userdata.token;
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  // Added state for image modal
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [chatUser, setChatUser] = useState(item);

  useEffect(() => {
    socketReadyRef.current = socketReady;
  }, [socketReady]);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    pendingQueueRef.current = pendingMessages;
  }, [pendingMessages]);

  const flatListRef = useRef(null);

  const pendingQueueRef = useRef([]);

  const chatIdRef = useRef(null);

  const socketReadyRef = useRef(false);

  const initializedRef = useRef(false);

  const typingTimerRef = useRef(null);

  const typingTimeoutRef = typingTimerRef;

  const chatInitialized = initializedRef;
  const messageCounter = useRef(0);

  const generateClientMessageId = () => {
    messageCounter.current += 1;

    return `client_${Date.now()}_${messageCounter.current}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
  };

  // Function to open image modal
  const openImageModal = imageUrl => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  useEffect(() => {
    if (!socket) return;

    console.log('📡 Registering chat socket listeners...');

    const handleConnect = () => {
      console.log('✅ Socket Connected:', socket.id);
      setSocketReady(true);

      initializeChat();
    };

    const handleTypingStatus = response => {
      setOtherUserTyping(!!response?.data?.isTyping);
    };

    const handleDisconnect = reason => {
      console.log('❌ Socket Disconnected:', reason);

      initializedRef.current = false;

      socketReadyRef.current = false;

      setSocketReady(false);
    };

    const handleConnectError = err => {
      console.log('🚨 Socket Connect Error:', err.message);

      socketReadyRef.current = false;

      setSocketReady(false);
    };

    const handleOpenChat = response => {
      if (!response?.data?._id) return;

      const newChatId = response.data._id;

      if (chatIdRef.current !== newChatId) {
        chatIdRef.current = newChatId;
        setChatId(newChatId);
      }

      if (Array.isArray(response?.msgData)) {
        setMessages(previous => {
          const merged = [...response.msgData];

          previous.forEach(localMessage => {
            const exists = merged.some(serverMessage => {
              if (
                localMessage.clientMessageId &&
                serverMessage.clientMessageId
              ) {
                return (
                  localMessage.clientMessageId === serverMessage.clientMessageId
                );
              }

              return (
                localMessage._id &&
                serverMessage._id &&
                String(localMessage._id) === String(serverMessage._id)
              );
            });

            if (!exists && localMessage.status === 'sending') {
              merged.push(localMessage);
            }
          });

          return merged;
        });
      }
    };

    const handleReceiveMessage = response => {
      const message = response.data || response;

      if (!message) return;

      setMessages(previousMessages => {
        const updatedMessages = [...previousMessages];

        const existingIndex = updatedMessages.findIndex(item => {
          if (
            item.clientMessageId &&
            message.clientMessageId &&
            item.clientMessageId === message.clientMessageId
          ) {
            return true;
          }

          if (
            item._id &&
            message._id &&
            String(item._id) === String(message._id)
          ) {
            return true;
          }

          return false;
        });

        if (existingIndex >= 0) {
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            ...message,
            status: message.readBy?.length > 0 ? 'read' : 'delivered',
          };

          return updatedMessages;
        }

        const alreadyExists = updatedMessages.some(item => {
          return (
            item._id && message._id && String(item._id) === String(message._id)
          );
        });

        if (alreadyExists) {
          return updatedMessages;
        }

        updatedMessages.push({
          ...message,
          status: message.status || 'sent',
        });

        return updatedMessages;
      });
    };

    const handleMessageRead = response => {
      const {messageId, clientMessageId, readBy} = response;

      setMessages(previous =>
        previous.map(message => {
          const matched =
            String(message._id) === String(messageId) ||
            message.clientMessageId === clientMessageId;

          if (!matched) {
            return message;
          }

          return {
            ...message,
            status: 'read',
            readBy,
          };
        }),
      );
    };

    const handleUserStatus = data => {
      if (String(data.userId) === String(chatUser._id)) {
        setChatUser(prev => ({
          ...prev,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
        }));
      }
    };

    const handleMessageDelivered = response => {
      console.log('✅ Delivered', response);

      updateMessageStatus(
        response.clientMessageId,
        response.status || 'delivered',
      );
    };

    const handleChatUpdated = response => {
      console.log('Chat Updated', response);
    };

    socket.off('connect', handleConnect);
    socket.off('disconnect', handleDisconnect);
    socket.off('connect_error', handleConnectError);
    socket.off('openChat', handleOpenChat);
    socket.off('receiveMsg', handleReceiveMessage);
    socket.off('isTyping', handleTypingStatus);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('openChat', handleOpenChat);
    socket.on('receiveMsg', handleReceiveMessage);
    socket.on('isTyping', handleTypingStatus);
    socket.on('messageRead', handleMessageRead);
    socket.on('userStatusChanged', handleUserStatus);
    socket.on('messageDelivered', handleMessageDelivered);

    socket.on('chatUpdated', handleChatUpdated);

    if (socket.connected && !initializedRef.current) {
      handleConnect();
    }

    return () => {
      console.log('🧹 Removing socket listeners...');

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('openChat', handleOpenChat);
      socket.off('receiveMsg', handleReceiveMessage);
      socket.off('isTyping', handleTypingStatus);
      socket.off('messageRead', handleMessageRead);
      socket.off('userStatusChanged', handleUserStatus);
      socket.off('messageDelivered', handleMessageDelivered);

      socket.off('chatUpdated', handleChatUpdated);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, chatUser._id, recipientId, userId]);

  useEffect(() => {
    if (!chatId) return;

    console.log('📨 Chat ready, processing pending messages...');

    processPendingMessages();
  }, [chatId]);
  const initializeChat = () => {
    if (!socket?.connected) return;

    if (chatInitialized.current) {
      return;
    }

    chatInitialized.current = true;

    console.log('📤 Creating Chat');

    socket.emit(
      'createChat',
      {
        userId: recipientId,
      },
      response => {
        console.log('createChat ACK', response);
      },
    );
  };

  const ensureSocketConnection = async () => {
    if (!socket) return false;
    if (socket.connected) return true;
    console.log('🔌 Attempting to reconnect socket...');
    return new Promise(resolve => {
      socket.connect();
      socket.once('connect', () => resolve(true));
      socket.once('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 5000);
    });
  };

  const pickImage = () => {
    try {
      launchImageLibrary({mediaType: 'photo'}, response => {
        if (!response.didCancel && response.assets) {
          const selectedImage = response.assets[0].uri;
          setImage(selectedImage);
          sendMessage('', selectedImage);
          console.log('📷 Image selected:', selectedImage);
        }
      });
    } catch (error) {
      console.error('🚨 Error picking image:', error.message);
    }
  };

  const sendMessage = async (msgText = '', imageUrl = '') => {
    if (!socketReady || !socket) {
      console.log('📨 Queuing message due to socket not ready:', {
        msgText,
        imageUrl,
      });
      setPendingMessages(prev => [...prev, {msgText, imageUrl}]);
      return;
    }

    const isConnected = await ensureSocketConnection();
    if (!isConnected) {
      console.log('📨 Queuing message due to connection failure:', {
        msgText,
        imageUrl,
      });
      setPendingMessages(prev => [...prev, {msgText, imageUrl}]);
      return;
    }

    if (!chatId) {
      console.warn('⏳ Waiting for chatId...');
      setPendingMessages(prev => [...prev, {msgText, imageUrl}]);
      return;
    }

    if (!msgText.trim() && !imageUrl) {
      console.log('⚠️ Nothing to send');
      return;
    }
    const clientMessageId = generateClientMessageId();

    try {
      let uploadedImageUrl = '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        uploadedImageUrl = await uploadImage(imageUrl);
        if (!uploadedImageUrl) {
          console.error('❌ Image upload failed');
          setPendingMessages(prev => [...prev, {msgText, imageUrl}]);
          return;
        }
      }

      const now = new Date().toISOString();

      const optimisticMessage = {
        clientMessageId,
        localId: clientMessageId,

        senderId: userId,

        msg: msgText.trim(),

        msgType: uploadedImageUrl || imageUrl ? 'image' : 'text',

        thumbnail: uploadedImageUrl || imageUrl || '',

        createdAt: now,

        date: now,

        status: 'sending',

        readBy: [],
      };

      setMessages(prev => {
        if (
          prev.some(
            m => m.clientMessageId === optimisticMessage.clientMessageId,
          )
        ) {
          return prev;
        }

        return [...prev, optimisticMessage];
      });

      const messagePayload = {
        clientMessageId,

        chatId,

        msg: optimisticMessage.msg,

        msgType: optimisticMessage.msgType,

        thumbnail: optimisticMessage.thumbnail,
      };

      console.log(
        '📤 Sending message',
        JSON.stringify(messagePayload, null, 2),
      );

      console.log('Sending Payload');

      console.log(messagePayload);

      console.log('Current chatId =', chatId);

      console.log('Socket Connected =', socket.connected);

      socket.emit('sendMsg', messagePayload, ack => {
        if (!ack) {
          updateMessageStatus(clientMessageId, 'failed');
          return;
        }

        if (ack.success) {
          updateMessageStatus(clientMessageId, 'sent');
        } else {
          updateMessageStatus(clientMessageId, 'failed');
        }
      });

      console.log('Message sent');

      setText('');
      setImage(null);
      setIsTyping(false);
      socket.emit('isTyping', {
        chatId,
        isTyping: false,
      });
    } catch (error) {
      console.error('🚨 Error in sendMessage:', error.message);
      updateMessageStatus(clientMessageId, 'failed');

      setPendingMessages(prev => [...prev, {msgText, imageUrl}]);
    }
  };

  const processPendingMessages = async () => {
    if (
      !socketReady ||
      !socket ||
      !socket.connected ||
      !chatId ||
      !pendingMessages.length
    ) {
      console.log('⏳ Skipping pending messages due to invalid state');
      return;
    }

    console.log('📨 Processing pending messages:', pendingMessages.length);
    const messagesToSend = [...pendingMessages];
    setPendingMessages([]);

    for (const {msgText, imageUrl} of messagesToSend) {
      await sendMessage(msgText, imageUrl);
    }
  };

  const updateMessageStatus = (id, status) => {
    setMessages(previous =>
      previous.map(message => {
        const matched =
          message.clientMessageId === id ||
          message.localId === id ||
          String(message._id) === String(id);

        if (!matched) {
          return message;
        }

        return {
          ...message,
          status,
        };
      }),
    );
  };

  const uploadImage = async uri => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      const response = await fetch(`${apiURL}/api/user/uploadImage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data?.data?.[0]) {
        console.log('✅ Image uploaded:', data.data[0]);
        return data.data[0];
      }
      console.error('❌ Image upload failed:', data);
      return null;
    } catch (error) {
      console.error('🚨 Image upload error:', error.message);
      return null;
    }
  };

  const handleTyping = value => {
    setText(value);

    if (!socket || !socket.connected || !chatId) return;

    if (!isTyping) {
      setIsTyping(true);

      socket.emit('isTyping', {
        chatId,
        isTyping: true,
      });
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      socket.emit('isTyping', {
        chatId,
        isTyping: false,
      });
    }, 2000);
  };

  const isMessageRead = message => {
    if (!Array.isArray(message.readBy)) {
      return false;
    }

    return message.readBy.some(
      item =>
        String(item.userId) === String(recipientId) && item.status === 'read',
    );
  };

  const previousLength = useRef(0);

  useEffect(() => {
    if (messages.length > previousLength.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      });
    }

    previousLength.current = messages.length;
  }, [messages.length]);

  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => {
      const first = new Date(
        a.createdAt || a.date || a.updatedAt || 0,
      ).getTime();

      const second = new Date(
        b.createdAt || b.date || b.updatedAt || 0,
      ).getTime();
      return first - second;
    });
  }, [messages]);

  const getMessageSenderId = message => {
    return (
      message.senderId ||
      message.sender?._id ||
      message.sender ||
      message.userId ||
      null
    );
  };

  const formatMessageTime = dateString => {
    // console.log('date', dateString);
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <KeyboardAvoidingContainer>
      <View
        style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff'}]}>
        <View
          style={[
            styles.rectangle2,
            {
              flexDirection: 'row',
              backgroundColor: isDark ? '#000' : '#fff',
              zIndex: 9999,
            },
          ]}>
          <Entypo
            onPress={() => navigation.goBack()}
            name="chevron-thin-left"
            size={20}
            color={isDark ? '#fff' : 'rgba(94, 95, 96, 1)'}
          />
          <Image
            source={{
              uri: chatUser?.profile?.[0] || 'https://via.placeholder.com/100',
            }}
            style={{
              width: 50,
              height: 50,
              marginLeft: 10,
              marginRight: 10,
              borderRadius: 69,
            }}
            resizeMode="contain"
          />
          <View style={{flex: 1}}>
            <Text
              numberOfLines={1}
              style={[
                styles.recListText,
                {
                  fontWeight: 'bold',
                  fontSize: 15,
                  width: 180,
                  color: isDark ? '#fff' : '#000',
                },
              ]}>
              {chatUser?.name || 'Unknown'}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.recListText,
                {
                  fontWeight: '500',
                  fontSize: 13,
                  width: 180,
                  marginTop: 5,
                  color: chatUser.isOnline ? 'rgba(75, 203, 27, 1)' : 'grey',
                },
              ]}>
              {chatUser.isOnline ? 'Active' : 'offline'}
            </Text>
          </View>
        </View>
        {otherUserTyping && (
          <Text
            style={{
              color: '#06C4D9',
              marginLeft: 15,
              marginBottom: 5,
              fontStyle: 'italic',
            }}>
            Typing...
          </Text>
        )}
        <FlatList
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{
            minIndexForVisible: 1,
          }}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
          data={sortedMessages}
          keyExtractor={item =>
            String(item._id || item.clientMessageId || item.localId)
          }
          renderItem={({item}) => {
            // console.log('🔍 Rendering message:', JSON.stringify(item, null, 2));
            const isSentByUser =
              String(getMessageSenderId(item)) === String(userId);
            const read = isMessageRead(item);

            const sending = item.status === 'sending';

            const delivered = item.status === 'delivered';

            const failed = item.status === 'failed';

            const sent = item.status === 'sent';

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: isSentByUser ? 'flex-end' : 'flex-start',
                }}>
                <View
                  style={[
                    isSentByUser
                      ? styles.senderContainer
                      : styles.receivermessageContainer,
                    isSentByUser ? styles.sentMessage : styles.receivedMessage,
                  ]}>
                  {item.msg && (
                    <Text
                      style={
                        isSentByUser ? styles.sendermessage : styles.message
                      }>
                      {item.msg}
                    </Text>
                  )}
                  {item.thumbnail && (
                    <TouchableOpacity
                      onPress={() => openImageModal(item.thumbnail)}>
                      <Image
                        source={{uri: item.thumbnail}}
                        style={styles.image}
                      />
                    </TouchableOpacity>
                  )}
                  <Text
                    style={[
                      styles.timeText,
                      isSentByUser
                        ? styles.sentTimeText
                        : styles.receivedTimeText,
                    ]}>
                    {formatMessageTime(item.createdAt || item.date)}
                  </Text>
                </View>
                {isSentByUser && (
                  <View style={styles.tickContainer}>
                    {failed ? (
                      <MaterialIcons
                        name="error-outline"
                        color="red"
                        size={14}
                      />
                    ) : sending ? (
                      <Ionicons name="time-outline" color="#888" size={12} />
                    ) : read ? (
                      <>
                        <Ionicons name="checkmark" size={12} color="#2196F3" />
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="#2196F3"
                          style={styles.doubleTick}
                        />
                      </>
                    ) : delivered ? (
                      <>
                        <Ionicons name="checkmark" size={12} color="#666" />
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="#666"
                          style={styles.doubleTick}
                        />
                      </>
                    ) : (
                      <Ionicons name="checkmark" size={12} color="#666" />
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Image Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.imageModalContainer,
                {backgroundColor: isDark ? '#121212' : '#fff'},
              ]}>
              {selectedImage && (
                <Image
                  source={{uri: selectedImage}}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={30}
                  color={isDark ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View
          style={[
            styles.inputContainer,
            {backgroundColor: isDark ? '#000' : '#fff'},
          ]}>
          <TextInput
            style={[styles.input, {color: isDark ? '#fff' : '#000'}]}
            value={text}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? '#888' : '#888'}
          />
          <TouchableOpacity onPress={pickImage}>
            <MaterialIcons
              name="image"
              size={30}
              color={isDark ? '#fff' : '#888'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => sendMessage(text)}
            style={styles.iconButton}>
            <Ionicons name={'send'} size={18} color="#fff" style={{left: 2}} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10},
  rectangle2: {
    backgroundColor: '#fff',
    width: Width * 0.95,
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  modalContent: {
    borderRadius: 5,
    width: 120,
    backgroundColor: 'white',
    elevation: 2,
  },
  receivermessageContainer: {
    padding: 8,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    marginVertical: 5,
    maxWidth: '80%',
  },
  senderContainer: {
    padding: 8,
    borderRadius: 10,
    borderTopRightRadius: 0,
    marginVertical: 5,
    maxWidth: '80%',
  },
  sentMessage: {backgroundColor: '#06C4D9'},
  receivedMessage: {backgroundColor: '#E0E0E0'},
  message: {fontSize: 16, color: '#000'},
  sendermessage: {fontSize: 16, color: '#fff'},
  image: {width: 150, height: 150, borderRadius: 10},
  inputContainer: {flexDirection: 'row', alignItems: 'center', padding: 10},
  input: {flex: 1, fontSize: 16, padding: 10, borderRadius: 10},
  iconButton: {
    padding: 9,
    backgroundColor: '#06C4D9',
    borderRadius: 50,
    marginLeft: 5,
  },
  tickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 5,
  },
  doubleTick: {marginLeft: -8},
  recListText: {},
  bigText: {},
  timeText: {
    fontSize: 8,
    alignSelf: 'flex-end',
    paddingTop: 2,
  },
  sentTimeText: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  receivedTimeText: {
    color: 'rgba(0,0,0,0.5)',
    alignSelf: 'flex-start',
  },
  // New styles for image modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: Width * 0.9,
    height: Width * 0.9,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 0,
  },
});

export default ChatScreen;
