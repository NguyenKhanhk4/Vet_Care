import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { SIZES, FONTS, ThemeColors, SHADOWS } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useCustomer } from '../../context/CustomerContext';

type Message = {
  id: string;
  text: string;
  sender: 'customer' | 'doctor';
  timestamp: Date;
};

const ChatCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { doctorId, doctorName } = route.params || {};
  const { colors } = useTheme();
  const { user } = useCustomer();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Mock initial messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.name || 'there'}! I'm Dr. ${doctorName || 'Doctor'}. How can I help you today?`,
      sender: 'doctor',
      timestamp: new Date(Date.now() - 3600000),
    }
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'customer',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Mock doctor reply after 1.5s
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. I will check the records and get back to you shortly.',
        sender: 'doctor',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1500);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender === 'customer';
    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
        {!isMine && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{doctorName ? doctorName.charAt(0) : 'D'}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextOther]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMine ? styles.messageTimeMine : styles.messageTimeOther]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    padding: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
    alignItems: 'flex-end',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  avatarText: {
    color: colors.primaryDark,
    ...FONTS.bold,
    fontSize: SIZES.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.light,
  },
  messageBubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.base,
    ...FONTS.medium,
  },
  messageTextMine: {
    color: colors.textWhite,
  },
  messageTextOther: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.spacing.md,
    paddingTop: SIZES.spacing.sm,
    paddingBottom: SIZES.spacing.sm,
    minHeight: 40,
    maxHeight: 100,
    color: colors.textPrimary,
    ...FONTS.medium,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.spacing.sm,
    marginBottom: -2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  sendIcon: {
    color: colors.textWhite,
    fontSize: 16,
    marginLeft: 2,
  },
});

export default ChatCustomerScreen;
