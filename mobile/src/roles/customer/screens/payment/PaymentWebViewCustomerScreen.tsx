import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { SIZES, FONTS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api, { ROOT_API_URL } from '../../../../shared/utils/api';

const PaymentWebViewCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { checkoutUrl, orderCode } = route.params;
  const { colors } = useTheme();
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const pollCount = useRef(0);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, []);

  const startPolling = () => {
    if (pollInterval.current) return;
    
    pollInterval.current = setInterval(async () => {
      pollCount.current += 1;
      
      if (pollCount.current > 30) {
        stopPolling();
        Alert.alert('Timeout', 'Payment result not received yet. Please check again later.');
        navigation.goBack();
        return;
      }

      try {
        const verifyUrl = `${ROOT_API_URL}/payment/verify/${orderCode}`;
        const res = await api.post(verifyUrl);
        const status = res.data?.data?.status;

        if (status === 'PAID') {
          stopPolling();
          navigation.replace('PaymentSuccessCustomer', { orderCode });
        } else if (status === 'FAILED' || status === 'CANCELLED') {
          stopPolling();
          navigation.replace('PaymentFailedCustomer', { orderCode });
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const verifyAndNavigate = async (success: boolean) => {
    stopPolling();
    if (success) {
      try {
        const verifyUrl = `${ROOT_API_URL}/payment/verify/${orderCode}`;
        await api.post(verifyUrl);
      } catch (err) {
        console.error('Verify payment error:', err);
      }
      navigation.replace('PaymentSuccessCustomer', { orderCode });
    } else {
      try {
        await api.post(`/payments/${orderCode}/cancel`);
      } catch (err) {
        console.error('Cancel payment error:', err);
      }
      navigation.replace('PaymentFailedCustomer', { orderCode });
    }
  };

  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    if (url.includes('payment-success')) {
      verifyAndNavigate(true);
      return false;
    } else if (url.includes('payment-failed')) {
      verifyAndNavigate(false);
      return false;
    }
    return true;
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { stopPolling(); navigation.goBack(); }}>
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 60 }} />
      </View>

      {hasError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Unable to load payment page.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setHasError(false); webViewRef.current?.reload(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: SIZES.spacing.base,
  },
  backButton: { padding: SIZES.spacing.sm },
  backText: { color: colors.textWhite, ...FONTS.medium, fontSize: SIZES.base },
  title: { color: colors.textWhite, ...FONTS.bold, fontSize: SIZES.lg },
  webview: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...FONTS.medium, fontSize: SIZES.base, color: colors.error, marginBottom: SIZES.spacing.md },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: SIZES.spacing.lg, paddingVertical: SIZES.spacing.sm, borderRadius: SIZES.radius.sm },
  retryText: { color: colors.textWhite, ...FONTS.medium },
  loadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: SIZES.spacing.sm, color: colors.textSecondary, ...FONTS.medium },
});

export default PaymentWebViewCustomerScreen;
