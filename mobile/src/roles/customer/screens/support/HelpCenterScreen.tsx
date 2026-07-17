import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const FAQItem = ({ question, answer, colors }: { question: string, answer: string, colors: ThemeColors }) => {
  const [expanded, setExpanded] = useState(false);
  const styles = getStyles(colors);

  return (
    <View style={styles.faqCard}>
      <TouchableOpacity 
        style={styles.faqHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqIcon}>{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const HelpCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const styles = getStyles(colors);

  const faqs = [
    { question: 'How do I book an appointment?', answer: 'Navigate to the Home or Clinics tab, select a clinic or doctor, choose a service and pet, then select an available date and time. Finally, confirm your booking.' },
    { question: 'How can I cancel an appointment?', answer: 'Go to the Appointments tab, select the appointment you wish to cancel, and tap the "Cancel" button. Note that cancellations might be subject to clinic policies.' },
    { question: 'Can I reschedule my booking?', answer: 'Currently, to reschedule, you must cancel your existing appointment and book a new one with the desired date and time.' },
    { question: 'How do I contact a veterinarian?', answer: 'You can contact the clinic directly via the phone number provided on the clinic details page.' },
    { question: 'What payment methods are accepted?', answer: 'We accept online payments via PayOS (QR code) and cash payments directly at the clinic.' },
    { question: 'How can I edit my profile?', answer: 'Go to the Profile tab, tap "Edit Profile", make your changes, and save them.' },
    { question: 'How do I delete my account?', answer: 'To delete your account, please contact our support team directly via email.' },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} colors={colors} />
          ))
        ) : (
          <Text style={styles.noResultsText}>No matching FAQs found.</Text>
        )}

        <Text style={styles.sectionTitle}>Contact Support</Text>

        <View style={styles.contactGrid}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@vetcare.com')}>
            <View style={styles.contactIconWrapper}>
              <Text style={styles.contactEmoji}>📧</Text>
            </View>
            <View>
              <Text style={styles.contactCardTitle}>Email Support</Text>
              <Text style={styles.contactCardSub}>support@vetcare.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+84123456789')}>
            <View style={styles.contactIconWrapper}>
              <Text style={styles.contactEmoji}>📞</Text>
            </View>
            <View>
              <Text style={styles.contactCardTitle}>Phone Support</Text>
              <Text style={styles.contactCardSub}>+84 123 456 789</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.8}>
            <View style={styles.contactIconWrapper}>
              <Text style={styles.contactEmoji}>💬</Text>
            </View>
            <View>
              <Text style={styles.contactCardTitle}>Live Chat</Text>
              <Text style={styles.contactCardSub}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.base,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.md,
    backgroundColor: colors.primary,
  },
  backButton: { padding: SIZES.spacing.xs },
  backIcon: { fontSize: 24, color: colors.textWhite, ...FONTS.bold },
  headerTitle: { fontSize: SIZES.lg, color: colors.textWhite, ...FONTS.semiBold },
  headerRight: { width: 30 },
  content: { flex: 1 },
  scrollContent: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.base,
    paddingHorizontal: SIZES.spacing.md,
    height: 50,
    ...SHADOWS.light,
    marginBottom: SIZES.spacing.lg,
  },
  searchIcon: { fontSize: 20, marginRight: SIZES.spacing.sm },
  searchInput: { flex: 1, fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  
  sectionTitle: {
    fontSize: SIZES.lg,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
  },
  noResultsText: {
    fontSize: SIZES.base,
    color: colors.textSecondary,
    ...FONTS.medium,
    textAlign: 'center',
    marginVertical: SIZES.spacing.lg,
  },

  // FAQ
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.base,
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.textPrimary,
    ...FONTS.semiBold,
    paddingRight: SIZES.spacing.sm,
  },
  faqIcon: {
    fontSize: 24,
    color: colors.primary,
    ...FONTS.bold,
  },
  faqBody: {
    padding: SIZES.spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  faqAnswer: {
    fontSize: SIZES.sm,
    color: colors.textSecondary,
    ...FONTS.medium,
    lineHeight: 20,
  },

  // Contact Grid
  contactGrid: {
    flexDirection: 'column',
    gap: SIZES.spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.base,
    padding: SIZES.spacing.md,
    ...SHADOWS.light,
  },
  contactIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  contactEmoji: { fontSize: 24 },
  contactCardTitle: {
    fontSize: SIZES.base,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  contactCardSub: {
    fontSize: SIZES.sm,
    color: colors.textSecondary,
    ...FONTS.medium,
  }
});

export default HelpCenterScreen;
