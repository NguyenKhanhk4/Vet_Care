import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Avatar, Card, Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import adminApi from '../../utils/adminApi';
import AdminBackButton from '../../components/AdminBackButton';
import { FONTS, SHADOWS, SIZES } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  age: number;
  weight: number;
  vaccineStatus: string;
  owner?: { name: string; email?: string; phone?: string };
}

const SPECIES_ICON: Record<string, string> = {
  dog: 'dog',
  cat: 'cat',
  bird: 'bird',
  rabbit: 'rabbit',
  fish: 'fish',
  reptile: 'snake',
};

const VACCINE_LABEL: Record<string, string> = {
  'up-to-date': 'Đã tiêm đầy đủ',
  overdue: 'Quá hạn tiêm',
  'not-vaccinated': 'Chưa tiêm',
  unknown: 'Chưa rõ',
};

const PetListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPets = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminApi.get('/pets', {
        params: { page: pageNumber, limit: 10, search: searchQuery },
      });
      const { pets: fetchedPets, pagination } = response.data.data;

      setPets(previous => (pageNumber === 1 || isRefresh ? fetchedPets : [...previous, ...fetchedPets]));
      setPage(pageNumber);
      setHasMore(pageNumber < pagination.pages);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(() => fetchPets(1), 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const onRefresh = useCallback(() => fetchPets(1, true), [searchQuery]);
  const loadMore = () => {
    if (hasMore && !loading && !refreshing) fetchPets(page + 1);
  };

  const renderItem = ({ item }: { item: Pet }) => {
    const vaccineColor = item.vaccineStatus === 'up-to-date' ? colors.success : colors.warning;
    return (
      <Card style={[styles.card, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon
            size={54}
            icon={SPECIES_ICON[item.species] || 'paw'}
            color={colors.primary}
            style={{ backgroundColor: colors.primaryLight }}
          />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {item.species}{item.breed ? ` • ${item.breed}` : ''} • {item.gender === 'male' ? 'Đực' : item.gender === 'female' ? 'Cái' : 'Chưa rõ'}
            </Text>
            <Text style={[styles.owner, { color: colors.textSecondary }]}>Chủ nuôi: {item.owner?.name || 'Không xác định'}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.meta, { color: colors.textLight }]}>{item.age || 0} tuổi • {item.weight || 0} kg</Text>
              <Text style={[styles.vaccine, { color: vaccineColor }]}>{VACCINE_LABEL[item.vaccineStatus] || 'Chưa rõ'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AdminBackButton navigation={navigation} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Thú cưng hệ thống</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Theo dõi toàn bộ thú cưng và chủ nuôi</Text>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Searchbar
          placeholder="Tìm tên hoặc giống thú cưng..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          iconColor={colors.primary}
          style={styles.searchbar}
        />
      </View>

      {loading && page === 1 ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.textLight }]}>Chưa có thú cưng phù hợp.</Text>}
          ListFooterComponent={hasMore && pets.length ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingLeft: 68, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: SIZES.xxl, ...FONTS.bold },
  subtitle: { fontSize: SIZES.sm, marginTop: 4 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  searchbar: { elevation: 0 },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: SIZES.radius.md, marginBottom: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: SIZES.base, ...FONTS.semiBold },
  detail: { fontSize: SIZES.sm, marginTop: 3 },
  owner: { fontSize: SIZES.sm, marginTop: 5, ...FONTS.medium },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  meta: { fontSize: SIZES.xs },
  vaccine: { fontSize: SIZES.xs, ...FONTS.semiBold },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: SIZES.md },
  footer: { margin: 20 },
});

export default PetListAdminScreen;
