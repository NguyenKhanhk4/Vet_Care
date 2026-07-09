/**
 * BookingCustomerScreen
 * Multi-step booking flow: Clinic → Doctor → Service → Pet → Date → Time → Confirm
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic, Doctor, Service, Pet } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import RatingStars from '../../../../shared/components/RatingStars';

const STEPS = ['Clinic', 'Doctor', 'Service', 'Pet', 'Date & Time', 'Confirm'];
const TIME_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const BookingCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  // Data lists
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  // Selections
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Pre-fill from route params
  useEffect(() => {
    const params = route.params || {};
    if (params.clinicId) loadClinicAndSkip(params.clinicId);
    else loadClinics();
  }, []);

  const loadClinics = async () => {
    setIsLoading(true);
    try { const res = await api.get('/clinics?limit=50'); setClinics(res.data.data || []); }
    catch { Alert.alert('Error', 'Failed to load clinics'); }
    finally { setIsLoading(false); }
  };

  const loadClinicAndSkip = async (clinicId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/clinics/${clinicId}`);
      setSelectedClinic(res.data.data);
      const docRes = await api.get(`/doctors?clinicId=${clinicId}`);
      setDoctors(docRes.data.data || []);
      setStep(1);
    } catch { loadClinics(); }
    finally { setIsLoading(false); }
  };

  const handleSelectClinic = async (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsLoading(true);
    try { const res = await api.get(`/doctors?clinicId=${clinic._id}`); setDoctors(res.data.data || []); }
    catch { Alert.alert('Error', 'Failed to load doctors'); }
    finally { setIsLoading(false); setStep(1); }
  };

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsLoading(true);
    try { const res = await api.get(`/services?clinicId=${selectedClinic?._id}`); setServices(res.data.data || []); }
    catch { Alert.alert('Error', 'Failed to load services'); }
    finally { setIsLoading(false); setStep(2); }
  };

  const handleSelectService = async (service: Service) => {
    setSelectedService(service);
    setIsLoading(true);
    try { const res = await api.get('/pets'); setPets(res.data.data || []); }
    catch { Alert.alert('Error', 'Failed to load pets'); }
    finally { setIsLoading(false); setStep(3); }
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    // Generate dates for next 14 days
    setStep(4);
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleConfirmBooking = async () => {
    if (!selectedClinic || !selectedDoctor || !selectedService || !selectedPet || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please complete all selections');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.post('/appointments', {
        clinic: selectedClinic._id, doctor: selectedDoctor._id, service: selectedService._id,
        pet: selectedPet._id, date: selectedDate, time: selectedTime, notes,
      });
      Alert.alert('Payment Success', 'Book Appointment successful!', [
        { text: 'Home', onPress: () => { navigation.popToTop(); navigation.navigate('Home'); } },
        { text: 'Appointments', onPress: () => { navigation.popToTop(); navigation.navigate('Appointments'); } },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    } finally { setIsSubmitting(false); }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepContainer}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotCompleted]}>
              <Text style={[styles.stepNumber, i <= step && styles.stepNumberActive]}>{i < step ? '✓' : i + 1}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 0: Select Clinic */}
        {step === 0 && clinics.map((clinic) => (
          <TouchableOpacity key={clinic._id} style={styles.selectionCard} onPress={() => handleSelectClinic(clinic)} activeOpacity={0.7}>
            <Text style={styles.cardEmoji}>🏥</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{clinic.name}</Text>
              <Text style={styles.cardSubtitle}>📍 {clinic.address}</Text>
              <RatingStars rating={clinic.rating} size={12} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Step 1: Select Doctor */}
        {step === 1 && doctors.map((doctor) => (
          <TouchableOpacity key={doctor._id} style={styles.selectionCard} onPress={() => handleSelectDoctor(doctor)} activeOpacity={0.7}>
            <Text style={styles.cardEmoji}>👨‍⚕️</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{doctor.user?.name || 'Doctor'}</Text>
              <Text style={styles.cardSubtitle}>{doctor.specialization}</Text>
              <Text style={styles.cardMeta}>{doctor.experience} years experience</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Step 2: Select Service */}
        {step === 2 && services.map((service) => (
          <TouchableOpacity key={service._id} style={styles.selectionCard} onPress={() => handleSelectService(service)} activeOpacity={0.7}>
            <Text style={styles.cardEmoji}>🩺</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{service.name}</Text>
              <Text style={styles.cardSubtitle}>{service.description}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.priceText}>{service.price.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.durationText}>{service.duration}min</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Step 3: Select Pet */}
        {step === 3 && (
          pets.length === 0 ? (
            <View style={styles.emptyPets}>
              <Text style={styles.emptyText}>No pets found. Please add a pet first.</Text>
              <TouchableOpacity style={styles.addPetBtn} onPress={() => navigation.navigate('Pets', { screen: 'AddPetCustomer' })}>
                <Text style={styles.addPetText}>Add Pet</Text>
              </TouchableOpacity>
            </View>
          ) : pets.map((pet) => (
            <TouchableOpacity key={pet._id} style={styles.selectionCard} onPress={() => handleSelectPet(pet)} activeOpacity={0.7}>
              <Text style={styles.cardEmoji}>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{pet.name}</Text>
                <Text style={styles.cardSubtitle}>{pet.breed || pet.species} • {pet.age}yr • {pet.weight}kg</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Step 4: Select Date & Time */}
        {step === 4 && (
          <View>
            <Text style={styles.sectionLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {generateDates().map((date) => (
                <TouchableOpacity key={date} style={[styles.dateCard, selectedDate === date && styles.dateCardActive]} onPress={() => setSelectedDate(date)} activeOpacity={0.7}>
                  <Text style={[styles.dateDay, selectedDate === date && styles.dateDayActive]}>{new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}</Text>
                  <Text style={[styles.dateNum, selectedDate === date && styles.dateNumActive]}>{new Date(date).getDate()}</Text>
                  <Text style={[styles.dateMonth, selectedDate === date && styles.dateMonthActive]}>{new Date(date).toLocaleDateString('en-GB', { month: 'short' })}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Select Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity key={time} style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]} onPress={() => setSelectedTime(time)} activeOpacity={0.7}>
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedDate && selectedTime && (
              <TouchableOpacity style={styles.nextButton} onPress={() => setStep(5)} activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <View style={styles.confirmSection}>
            <Text style={styles.confirmTitle}>Booking Summary</Text>
            {[
              { label: 'Clinic', value: selectedClinic?.name, icon: '🏥' },
              { label: 'Doctor', value: selectedDoctor?.user?.name, icon: '👨‍⚕️' },
              { label: 'Service', value: selectedService?.name, icon: '🩺' },
              { label: 'Pet', value: selectedPet?.name, icon: '🐾' },
              { label: 'Date', value: selectedDate ? formatDate(selectedDate) : '', icon: '📅' },
              { label: 'Time', value: selectedTime, icon: '⏰' },
              { label: 'Amount', value: `${(selectedService?.price || 0).toLocaleString('vi-VN')}đ`, icon: '💰' },
            ].map((item, i) => (
              <View key={i} style={styles.confirmRow}>
                <Text style={styles.confirmIcon}>{item.icon}</Text>
                <Text style={styles.confirmLabel}>{item.label}</Text>
                <Text style={styles.confirmValue}>{item.value}</Text>
              </View>
            ))}

            <TouchableOpacity style={[styles.bookButton, isSubmitting && styles.disabled]} onPress={handleConfirmBooking} disabled={isSubmitting} activeOpacity={0.8}>
              <Text style={styles.bookButtonText}>{isSubmitting ? 'Booking...' : 'Confirm Booking'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Back Button */}
      {step > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  stepContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: SIZES.spacing.base, paddingHorizontal: SIZES.spacing.base },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.divider, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotCompleted: { backgroundColor: colors.primaryDark },
  stepNumber: { fontSize: SIZES.xs, color: colors.textLight, ...FONTS.bold },
  stepNumberActive: { color: colors.textWhite },
  stepLine: { width: 20, height: 2, backgroundColor: colors.divider, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: colors.primary },
  stepLabel: { textAlign: 'center', fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.semiBold, marginVertical: SIZES.spacing.md },
  content: { flex: 1, paddingHorizontal: SIZES.spacing.base },
  selectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  cardEmoji: { fontSize: 32, marginRight: SIZES.spacing.md },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  cardSubtitle: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 2 },
  cardMeta: { fontSize: SIZES.xs, color: colors.textLight },
  priceCol: { alignItems: 'flex-end' },
  priceText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  durationText: { fontSize: SIZES.xs, color: colors.textLight },
  emptyPets: { alignItems: 'center', padding: SIZES.spacing.xxl },
  emptyText: { fontSize: SIZES.base, color: colors.textSecondary, marginBottom: SIZES.spacing.base },
  addPetBtn: { backgroundColor: colors.primary, paddingVertical: SIZES.spacing.md, paddingHorizontal: SIZES.spacing.xl, borderRadius: SIZES.radius.base },
  addPetText: { color: colors.textWhite, ...FONTS.semiBold },
  sectionLabel: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: SIZES.spacing.md, marginTop: SIZES.spacing.base },
  dateScroll: { marginBottom: SIZES.spacing.base },
  dateCard: { width: 64, height: 80, borderRadius: SIZES.radius.base, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.sm, borderWidth: 1, borderColor: colors.border },
  dateCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontSize: SIZES.xs, color: colors.textLight },
  dateDayActive: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold },
  dateNumActive: { color: colors.textWhite },
  dateMonth: { fontSize: SIZES.xs, color: colors.textLight },
  dateMonthActive: { color: 'rgba(255,255,255,0.8)' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacing.sm },
  timeSlot: { paddingVertical: SIZES.spacing.sm, paddingHorizontal: SIZES.spacing.base, borderRadius: SIZES.radius.base, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  timeSlotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeText: { fontSize: SIZES.md, color: colors.textPrimary },
  timeTextActive: { color: colors.textWhite, ...FONTS.medium },
  nextButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', marginTop: SIZES.spacing.xl, ...SHADOWS.light },
  nextButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
  confirmSection: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xl, ...SHADOWS.medium },
  confirmTitle: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.lg, textAlign: 'center' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  confirmIcon: { fontSize: 18, width: 30 },
  confirmLabel: { fontSize: SIZES.md, color: colors.textSecondary, width: 70 },
  confirmValue: { flex: 1, fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, textAlign: 'right' },
  bookButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', marginTop: SIZES.spacing.xl, ...SHADOWS.medium },
  disabled: { opacity: 0.7 },
  bookButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
  backButton: { paddingVertical: SIZES.spacing.md, paddingHorizontal: SIZES.spacing.xl, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.surface },
  backButtonText: { fontSize: SIZES.base, color: colors.primary, ...FONTS.medium },
});

export default BookingCustomerScreen;
