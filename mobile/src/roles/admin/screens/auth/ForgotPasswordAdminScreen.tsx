import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import adminApi from '../../utils/adminApi';

const ForgotPasswordAdminScreen = ({ navigation }: any) => {
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your admin email');
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.post('/auth/forgot-password', { email });
      setIsSent(true);
      Alert.alert('Success', response.data.message || 'Reset instructions sent');
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to send reset instructions'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {isSent 
              ? 'Check your email for reset instructions.'
              : 'Enter your admin email address to receive password reset instructions.'}
          </Text>

          {!isSent ? (
            <>
              <TextInput
                label="Admin Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Send Instructions
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            >
              Back to Login
            </Button>
          )}

          {!isSent && (
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
              textColor={theme.colors.primary}
            >
              Back to Login
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    marginBottom: 24,
    backgroundColor: 'white',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordAdminScreen;
