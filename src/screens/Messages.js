import {useIsFocused} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;

const Messages = ({navigation}) => {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const {
    userdata,
    socket,
    userRole,
    getFilteredPosts,
    filteredPosts,
    getBuyersList,
    buyerList,
    Userfulldata,
  } = useContext(AuthContext);

  const [filteredLists, setFilteredLists] = useState([]);
  const [chatListData, setChatListData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAllUsers, setSearchAllUsers] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const isFocused = useIsFocused();
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  // Throttle fetchChatList to once every 5 seconds
  const fetchChatList = useCallback(() => {
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    if (!socket.connected) {
      console.log('❌ Socket not connected');
      return;
    }

    if (isFetchingRef.current) {
      console.log('⏳ Chat list request already running');
      return;
    }

    const now = Date.now();

    if (now - lastFetchRef.current < 2000) {
      console.log('⏳ Skipping duplicate request');
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    setChatLoading(true);

    console.log('📤 Fetching chat list...');

    socket.emit('chatList');
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlechatList = response => {
      console.log('📥 Chat List Received');

      setChatLoading(false);
      isFetchingRef.current = false;

      if (response?.data && Array.isArray(response.data)) {
        setChatListData(response.data);
      } else {
        setChatListData([]);
      }
    };

    const handleChatUpdated = () => {
      console.log('📩 chatUpdated');

      fetchChatList();
    };

    const handleConnect = () => {
      console.log('✅ Socket Connected');

      fetchChatList();
    };

    const handleDisconnect = reason => {
      console.log('❌ Socket Disconnected:', reason);
      isFetchingRef.current = false;
      setChatLoading(false);
    };

    const handleConnectError = err => {
      console.log('❌ Socket Error:', err.message);
      isFetchingRef.current = false;
      setChatLoading(false);
    };

    socket.on('chatList', handlechatList);
    socket.on('chatUpdated', handleChatUpdated);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('chatList', handlechatList);
      socket.off('chatUpdated', handleChatUpdated);

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, fetchChatList]);

  useEffect(() => {
    if (!isFocused || !socket) return;

    console.log('🔄 Screen focused');

    if (userdata?.role === 'buyer') {
      getFilteredPosts();
    } else {
      getBuyersList();
    }

    fetchChatList();

    setChatLoading(false);
    setIsSearching(false);
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    if (chatListData.length > 0) {
      console.log('✅ Existing chats found');

      setSearchAllUsers(false);
    } else {
      console.log('👤 No chats yet');

      setSearchAllUsers(true);
    }
  }, [chatListData, isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    if (userdata?.role === 'buyer') {
      getFilteredPosts();
    }

    if (userdata?.role === 'seller') {
      getBuyersList();
    }
  }, [isFocused, userdata?.role, socket]);

  const preFetchChatId = useCallback(
    recipientId => {
      if (!socket || !socket.connected) {
        return;
      }

      socket.once('openChat', response => {
        console.log('✅ openChat:', response);

        if (response?.data?._id) {
          navigation.navigate('Chatscreen', {
            item: {
              _id: recipientId,
              chatId: response.data._id,
            },
          });
        }
      });

      socket.emit('createChat', {
        userId: recipientId,
      });
    },
    [socket, navigation],
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
    return messageDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
  };

  const renderChatListItem = useCallback(
    ({item}) => {
      const preview =
        item.lastMessage?.msg || item.lastMsg?.msg || 'No messages';
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
      console.log('Rendering renderChatListItem:', item);
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
              {flexDirection: 'row', backgroundColor: isDark ? '#000' : '#fff'},
            ]}>
            <Image
              source={{
                uri:
                  item.chatWithUser?.profile?.[0] ||
                  'https://via.placeholder.com/66',
              }}
              style={{width: 66, height: 66, marginRight: 20, borderRadius: 50}}
              resizeMode="cover"
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
            <View style={{flex: 1}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    fontWeight: 'bold',
                    fontSize: 16,
                    width: 180,
                    color: isDark ? '#fff' : '#000',
                  },
                ]}>
                {item.chatWithUser?.name
                  ? item.chatWithUser.name.charAt(0).toUpperCase() +
                    item.chatWithUser.name.slice(1)
                  : 'Unknown'}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.messagePreviewText,
                  {color: isDark ? '#fff' : '#1d1e20'},
                ]}>
                {preview}
                <Text style={styles.timeElapsedText}>
                  {' • '}
                  {formatTimeElapsed(
                    item.lastMessage?.date || item.lastMsg?.date,
                  )}
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
    ({item}) => {
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
      console.log('Rendering seller FilteredPostItem:', item);
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
              {flexDirection: 'row', backgroundColor: isDark ? '#000' : '#fff'},
            ]}>
            <Image
              source={
                item?.profile?.[0]
                  ? {uri: item.profile[0]}
                  : require('../assets/profile.png')
              }
              style={{width: 60, height: 60, marginRight: 20, borderRadius: 50}}
              resizeMode="cover"
            />
            <View style={{flex: 1}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    fontWeight: 'bold',
                    fontSize: 16,
                    width: 180,
                    color: isDark ? '#fff' : '#000',
                  },
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

  const availableUsers = userdata?.role === 'buyer' ? filteredPosts : buyerList;

  const listData = React.useMemo(() => {
    if (isSearching) return filteredLists;

    if (searchAllUsers) return availableUsers;

    return chatListData;
  }, [
    isSearching,
    filteredLists,
    searchAllUsers,
    availableUsers,
    chatListData,
  ]);

  const renderItem = React.useMemo(() => {
    return searchAllUsers ? renderFilteredPostItem : renderChatListItem;
  }, [searchAllUsers, renderFilteredPostItem, renderChatListItem]);

  console.log('searchAllUsers:', searchAllUsers);
  console.log('filteredPosts:', filteredPosts.length);
  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header="Messages" />
      <View style={{padding: 10}}>
        <SearchBar
          placeholder="Search"
          lists={
            searchAllUsers
              ? userdata?.role === 'buyer'
                ? filteredPosts
                : buyerList
              : chatListData
          }
          setFilteredLists={setFilteredLists}
          searchKey={searchAllUsers ? 'name' : 'chatWithUser.name'}
          onFocus={handleSearchFocus}
        />
      </View>
      {chatLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </View>
      ) : null}
      <FlatList
        data={listData}
        renderItem={renderItem}
        extraData={[searchAllUsers, isSearching, chatLoading]}
        keyExtractor={(item, index) =>
          String(
            searchAllUsers
              ? item?._id ?? index
              : item?.chatWithUser?._id ?? index,
          )
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        refreshing={chatLoading}
        onRefresh={fetchChatList}
        ListEmptyComponent={
          <Text
            style={{
              color: isDark ? '#fff' : '#000',
              textAlign: 'center',
              marginTop: 20,
            }}>
            {searchAllUsers
              ? 'No users available'
              : 'Start a conversation to see your chats'}
          </Text>
        }
      />
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: searchAllUsers
              ? '#06C4D9'
              : isDark
              ? '#333'
              : '#fff',
          },
        ]}
        onPress={toggleSearchAllUsers}>
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
  screen: {flex: 1},
  rectangle2: {
    width: Width * 0.95,
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  recListText: {color: '#1d1e20'},
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
