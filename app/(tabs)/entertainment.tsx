import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  Radio,
  Music,
  Gamepad2,
  Newspaper,
  Cloud,
  BookOpen,
  Tv,
  Headphones,
  Puzzle,
  Heart,
} from 'lucide-react-native';
import { COLORS } from '@/constants/launcher-config';

interface EntertainmentItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export default function EntertainmentScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const openWebLink = (url: string, title: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Unable to open ${title}`);
      });
    }
  };

  const entertainmentItems: EntertainmentItem[] = [
    {
      id: 'radio',
      title: 'Radio',
      subtitle: 'Listen to music & news',
      icon: <Radio size={32} color="#fff" />,
      color: '#FF6B6B',
      action: () => openWebLink('https://www.iheart.com/', 'Radio'),
    },
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Relaxing melodies',
      icon: <Music size={32} color="#fff" />,
      color: '#4ECDC4',
      action: () => openWebLink('https://www.youtube.com/results?search_query=relaxing+music+for+seniors', 'Music'),
    },
    {
      id: 'games',
      title: 'Games',
      subtitle: 'Solitaire & Puzzles',
      icon: <Gamepad2 size={32} color="#fff" />,
      color: '#95E77E',
      action: () => openWebLink('https://www.solitr.com/', 'Games'),
    },
    {
      id: 'crossword',
      title: 'Crossword',
      subtitle: 'Daily puzzles',
      icon: <Puzzle size={32} color="#fff" />,
      color: '#FFE66D',
      action: () => openWebLink('https://www.nytimes.com/crosswords/game/mini', 'Crossword'),
    },
    {
      id: 'news',
      title: 'News',
      subtitle: 'Latest headlines',
      icon: <Newspaper size={32} color="#fff" />,
      color: '#A8E6CF',
      action: () => openWebLink('https://news.google.com/', 'News'),
    },
    {
      id: 'weather',
      title: 'Weather',
      subtitle: 'Local forecast',
      icon: <Cloud size={32} color="#fff" />,
      color: '#87CEEB',
      action: () => openWebLink('https://weather.com/', 'Weather'),
    },
    {
      id: 'stories',
      title: 'Stories',
      subtitle: 'Short stories & articles',
      icon: <BookOpen size={32} color="#fff" />,
      color: '#DDA0DD',
      action: () => openWebLink('https://www.shortstoryproject.com/', 'Stories'),
    },
    {
      id: 'videos',
      title: 'Videos',
      subtitle: 'Watch shows & clips',
      icon: <Tv size={32} color="#fff" />,
      color: '#FF8C94',
      action: () => openWebLink('https://www.youtube.com/', 'Videos'),
    },
    {
      id: 'podcasts',
      title: 'Podcasts',
      subtitle: 'Listen to shows',
      icon: <Headphones size={32} color="#fff" />,
      color: '#B19CD9',
      action: () => openWebLink('https://www.spotify.com/us/podcasts/', 'Podcasts'),
    },
    {
      id: 'wellness',
      title: 'Wellness',
      subtitle: 'Meditation & exercises',
      icon: <Heart size={32} color="#fff" />,
      color: '#FFB6C1',
      action: () => openWebLink('https://www.youtube.com/results?search_query=chair+exercises+for+seniors', 'Wellness'),
    },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'audio', label: 'Audio' },
    { id: 'games', label: 'Games' },
    { id: 'reading', label: 'Reading' },
  ];

  const filterItems = () => {
    if (selectedCategory === 'all') return entertainmentItems;
    
    switch (selectedCategory) {
      case 'audio':
        return entertainmentItems.filter(item => 
          ['radio', 'music', 'podcasts'].includes(item.id)
        );
      case 'games':
        return entertainmentItems.filter(item => 
          ['games', 'crossword'].includes(item.id)
        );
      case 'reading':
        return entertainmentItems.filter(item => 
          ['news', 'stories'].includes(item.id)
        );
      default:
        return entertainmentItems;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entertainment</Text>
        <Text style={styles.headerSubtitle}>Fun & Relaxation</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filterItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={item.action}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            Tap any card to open the entertainment option. All content is optimized for easy viewing and listening.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  categoryContainer: {
    maxHeight: 60,
    marginVertical: 10,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tipContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#E8F4FD',
    borderRadius: 15,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});