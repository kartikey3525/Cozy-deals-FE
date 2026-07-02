import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../context/themeContext';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import { AuthContext } from '../context/authcontext';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { throttle } from 'lodash';

const Width = Dimensions.get('window').width;

const Messages = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { userdata, socket, userRole, getFilteredPosts, filteredPosts, getBuyersList, buyerList ,Userfulldata} =
    useContext(AuthContext);

  const [filteredLists, setFilteredLists] = useState([]);
  const [chatListData, setChatListData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAllUsers, setSearchAllUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const lastFetchRef = useRef(0); // Track last fetch time

  // Throttle fetchChatList to once every 5 seconds
  const fetchChatList = useCallback(
    throttle(
      socketInstance => {
        if (!socketInstance || !socketInstance.connected) {
          console.error('❌ Socket not connected, cannot fetch chat list');
          setIsLoading(false);
          return;
        }
        const now = Date.now();
        if (now - lastFetchRef.current < 5000) {
          console.log('⏳ Skipping chatList fetch due to throttle');
          setIsLoading(false);
          return;
        }
        console.log('🔹 Emitting chatList request for user:', userdata._id);
        setIsLoading(true);
        socketInstance.emit('chatList', { userToken: userdata.token });
        lastFetchRef.current = now;
      },
      5000,
      { leading: true, trailing: false },
    ),
    [userdata._id, userdata.token],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('chatListResponse', response => {
      console.log('📩 Received chatListResponse:', JSON.stringify(response, null, 2));
      setIsLoading(false);
      if (response?.data && Array.isArray(response.data)) {
        console.log('🔍 Chat list count:', response.data.length);
        setChatListData(prev => {
          // Avoid unnecessary updates if data hasn't changed
          if (JSON.stringify(prev) === JSON.stringify(response.data)) {
            return prev;
          }
          return response.data;
        });
      } else {
        console.error('❌ Invalid chatListResponse:', response);
        setChatListData([]);
      }
    });

    socket.on('connect', () => {
      console.log('✅ Messages socket connected:', socket.id);
      fetchChatList(socket);
    });

    return () => {
      socket.off('chatListResponse');
      fetchChatList.cancel(); // Cancel throttled calls
    };
  }, [socket, ]);

  useEffect(() => {
    if (isFocused && socket) {
      console.log('🔄 Screen focused, refreshing data');
      userRole === 'buyer' ? getFilteredPosts() : getBuyersList();
      if (socket.connected) {
        fetchChatList(socket);
      }
      setIsSearching(false);
      setSearchAllUsers(false);
    }
  }, [isFocused, socket,]);

  useEffect(() => {
    if (!isSearching) {
      setFilteredLists(
        searchAllUsers
          ? userRole === 'buyer'
            ? filteredPosts
            : buyerList
          : chatListData,
      );
    }
  }, [searchAllUsers, chatListData, isSearching, userRole, filteredPosts, buyerList]);

  const preFetchChatId = useCallback(
    (recipientId, callback) => {
      // Log initial call details
      console.log(`[${new Date().toISOString()}] 🔍 preFetchChatId called`, {
        recipientId,
        socketExists: !!socket,
        socketConnected: socket?.connected,
        userToken: userdata.token ? '[REDACTED]' : 'missing',
      });
  
      // Check socket validity
      if (!socket) {
        console.error(`[${new Date().toISOString()}] ❌ No socket instance available`);
        callback(null);
        return;
      }
  
      if (!socket.connected) {
        console.error(`[${new Date().toISOString()}] ❌ Socket not connected for pre-fetch`);
        callback(null);
        return;
      }
  
      // Validate inputs
      if (!recipientId || !userdata.token) {
        console.error(`[${new Date().toISOString()}] ❌ Invalid inputs`, {
          recipientId,
          hasToken: !!userdata.token,
        });
        callback(null);
        return;
      }
  
      // Set up a timeout to detect no response
      const timeout = setTimeout(() => {
        console.error(`[${new Date().toISOString()}] ⏳ Timeout: No response for createChat after 10s`, {
          recipientId,
        });
        callback(null);
      }, 10000); // 10 seconds timeout
  
      try {
        console.log(`[${new Date().toISOString()}] 🔹 Emitting createChat for recipient: ${recipientId}`);
        socket.emit(
          'createChat',
          { userId: recipientId, userToken: userdata.token },
          response => {
            // Clear timeout since we got a response
            clearTimeout(timeout);
  
            console.log(`[${new Date().toISOString()}] 📩 createChat response received`, {
              response: JSON.stringify(response, null, 2),
              isArray: Array.isArray(response),
            });
  
            let data = response;
            if (Array.isArray(response)) {
              console.warn(`[${new Date().toISOString()}] ⚠️ createChat response is an array, using first element`);
              data = response[0] || {};
            }
  
            if (data?.data?._id) {
              console.log(`[${new Date().toISOString()}] ✅ Pre-fetched chatId: ${data.data._id}`);
              callback(data.data._id);
            } else {
              console.error(`[${new Date().toISOString()}] ❌ No chatId in response`, {
                data: JSON.stringify(data, null, 2),
              });
              callback(null);
            }
          },
        );
  
        // Log emission success
        console.log(`[${new Date().toISOString()}] ✅ createChat event emitted`);
      } catch (error) {
        clearTimeout(timeout);
        console.error(`[${new Date().toISOString()}] 🚨 Error emitting createChat`, {
          error: error.message,
          stack: error.stack,
        });
        callback(null);
      }
    },
    [socket, userdata.token],
  );

  const handleSearchFocus = () => setIsSearching(true);

  const toggleSearchAllUsers = () => {
    setSearchAllUsers(prev => !prev);
    setIsSearching(false);
  };

  const formatTimeElapsed = dateString => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderChatListItem = useCallback(
    ({ item }) => {
      const navigateToChat = () => { 
          navigation.navigate('Chatscreen', {
            item: {
              _id: item.chatWithUser._id,
              name: item.chatWithUser.name || 'Unknown',
              profile: item.chatWithUser.profile || [''],
              isOnline: item.chatWithUser.isOnline || false,
            }, 
        }); 
      };

      return (
        <Pressable
          onPress={() => navigateToChat(item)}
          style={{
            justifyContent: 'center',
            marginBottom: 10,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderColor: isDark ? '#ccc' : 'rgba(0, 0, 0, 0.1)',
          }}>
          <View
            style={[
              styles.rectangle2,
              { flexDirection: 'row', backgroundColor: isDark ? '#000' : '#fff' },
            ]}>
            <Image
              source={{ uri: item.chatWithUser?.profile?.[0] || 'https://via.placeholder.com/66' }}
              style={{ width: 66, height: 66, marginRight: 20, borderRadius: 50 }}
              resizeMode="contain"
            />
            {item.chatWithUser?.isOnline && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 10,
                  position: 'absolute',
                  left: 60,
                  bottom: 0,
                  marginBottom: 10,
                  backgroundColor: 'rgba(75, 203, 27, 1)',
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  { fontWeight: 'bold', fontSize: 16, width: 180, color: isDark ? '#fff' : '#000' },
                ]}>
                {item.chatWithUser?.name
                  ? item.chatWithUser.name.charAt(0).toUpperCase() + item.chatWithUser.name.slice(1)
                  : 'Unknown'}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.messagePreviewText, { color: isDark ? '#fff' : '#1d1e20' }]}>
                {item.lastMessage?.msg || 'No messages'}
                <Text style={styles.timeElapsedText}>
                  {' • '}
                  {formatTimeElapsed(item.lastMessage?.date)}
                </Text>
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [isDark, navigation, preFetchChatId],
  );

  const renderFilteredPostItem = useCallback(
    ({ item }) => {
      const navigateToChat = () => { 
          navigation.navigate('Chatscreen', {
            item: {
              _id: item._id,
              name: item.name || 'Unknown',
              profile: item.profile || [''],
              isOnline: item.isOnline || false,
            }, 
        }); 
      };

      return (
        <Pressable
          onPress={navigateToChat}
          style={{
            justifyContent: 'center',
            marginBottom: 10,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderColor: isDark ? '#ccc' : 'rgba(0, 0, 0, 0.1)',
          }}>
          <View
            style={[
              styles.rectangle2,
              { flexDirection: 'row', backgroundColor: isDark ? '#000' : '#fff' },
            ]}>
            <Image
              source={
                item?.profile?.[0]
                  ? { uri: item.profile[0] }
                  : require('../assets/profile.png')
              }
              style={{ width: 60, height: 60, marginRight: 20, borderRadius: 50 }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  { fontWeight: 'bold', fontSize: 16, width: 180, color: isDark ? '#fff' : '#000' },
                ]}>
                {item.name || 'Untitled'}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    fontWeight: '500',
                    fontSize: 14,
                    marginTop: 5,
                    color: isDark ? '#fff' : '#1d1e20',
                  },
                ]}>
                {item.email || 'No email'}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [isDark, navigation, preFetchChatId],
  );

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Header header="Messages" />
      <View style={{ padding: 10 }}>
        <SearchBar
          placeholder="Search"
          lists={searchAllUsers ? (userRole === 'buyer' ? filteredPosts : buyerList) : chatListData}
          setFilteredLists={setFilteredLists}
          searchKey={searchAllUsers ? 'name' : 'chatWithUser.name'}
          onFocus={handleSearchFocus}
        />
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </View>
      ) : (
        <FlatList
          data={isSearching ? filteredLists : searchAllUsers ? (userRole === 'buyer' ? filteredPosts : buyerList) : chatListData}
          renderItem={searchAllUsers ? renderFilteredPostItem : renderChatListItem}
          keyExtractor={(item, index) =>
            searchAllUsers ? `${item._id}-${index}` : `${item.chatWithUser?._id}-${index}`
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: isDark ? '#fff' : '#000', textAlign: 'center', marginTop: 20 }}>
              {searchAllUsers ? 'No users found' : 'No chats available'}
            </Text>
          }
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: searchAllUsers ? '#06C4D9' : isDark ? '#333' : '#fff' }]}
        onPress={toggleSearchAllUsers}
      >
        <MaterialIcons
          name={searchAllUsers ? 'chat' : 'person-add'}
          size={24}
          color={searchAllUsers ? '#fff' : isDark ? '#fff' : '#000'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  rectangle2: {
    width: Width * 0.95,
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  recListText: { color: '#1d1e20' },
  messagePreviewText: {
    fontWeight: '500',
    fontSize: 14,
    width: 180,
    marginTop: 5,
  },
  timeElapsedText: {
    fontSize: 12,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    borderRadius: 28,
    elevation: 8,
  },
  unreadBadge: {
    backgroundColor: '#06C4D9',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Messages;