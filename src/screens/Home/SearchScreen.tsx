import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Keyboard,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { colors } from "@/lib/colors";
import { matchApi } from "@/lib/api/match.api";
import UserProfileModal from "./UserProfileModal";
import { searchApi } from "@/lib/api/search.api";
import { getStyles, } from "./SearchScreen.styles";
import { useDebounce } from "@/utils/useDebounce";
import { useTheme } from "@/lib/context/theme-context";

// Interface aligned with the backend search router response schema
interface SearchUser {
  id: string; // This holds the user's backend userId
  name: string;
  age: number;
  gender: string;
  college: string;
  photos: string[];
  isFriends: boolean;
  hasSent: boolean; // Tracks pending sent requests cleanly
}

// Explicit type for mutation payload to secure state isolation
interface AddFriendPayload {
  targetUserId: string;
  searchQuery: string;
  isRandomMode: boolean;
}

export default function SearchScreen() {
  const { theme } = useTheme();
    const styles = getStyles(theme);

  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [isRandom, setIsRandom] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Modal State Management
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const debouncedQuery = useDebounce(query, 500);

  // Entry animation
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  // 1. TANSTACK QUERY FOR SEARCH LOGIC
  const {
    data: searchResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["searchUsers", debouncedQuery.trim(), isRandom],
    queryFn: () =>
      searchApi.getUsers(
        isRandom ? { random: "true" } : { name: debouncedQuery.trim() },
      ),
    enabled: isRandom || debouncedQuery.trim().length > 0,
  });

  const results: SearchUser[] = searchResponse?.users || [];

  // Trigger search on query change
  const handleSearch = (text: string) => {
    if (text === "") {
      queryClient.setQueryData(["searchUsers", "", false], { users: [] });
    }
    setIsRandom(false);
    setQuery(text);
    setHasInteracted(true);
  };

  // Trigger random user fetching
  const meetRandomPeople = () => {
    setQuery("");
    setIsRandom(true);
    setHasInteracted(true);
    Keyboard.dismiss();
  };

  // 2. TANSTACK MUTATION WITH ISOLATED STATE PAYLOAD
  const addFriendMutation = useMutation({
    mutationFn: (variables: AddFriendPayload) =>
      matchApi.like(variables.targetUserId),
    onSuccess: (data, variables) => {
      const { targetUserId, searchQuery, isRandomMode } = variables;

      // Target the precise query context snapshot captured at the moment of interaction
      queryClient.setQueryData(
        ["searchUsers", searchQuery, isRandomMode],
        (oldData: any) => {
          if (!oldData?.users) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((user: SearchUser) =>
              user.id === targetUserId ? { ...user, hasSent: true } : user,
            ),
          };
        },
      );

      // Maintain side effects across downstream screens clean without refetching self
      queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
    onError: (error) => {
      console.error("Failed to add friend:", error);
    },
  });

  // 3. ACTIONS HANDLERS
  const handleView = (user: SearchUser) => {
    const profilePayload = {
      id: user.id,
      userId: user.id,
      name: user.name,
      age: user.age,
      photo: user.photos?.[0] || "",
      photos: user.photos || [],
      college: user.college,
      genderIdentity: user.gender,
      major: "Student",
      year: "",
      bio: "",
      relationshipGoal: "",
      interests: [],
      studyPreferences: "",
    };
    setSelectedUser(profilePayload);
    setModalVisible(true);
  };

  const handleAdd = (user: SearchUser) => {
    if (user.isFriends || user.hasSent || addFriendMutation.isPending) return;

    // Inject current parameters into variables payload to prevent context loss
    addFriendMutation.mutate({
      targetUserId: user.id,
      searchQuery: query.trim(),
      isRandomMode: isRandom,
    });
  };

  // 4. SUB-RENDERERS
  const renderRandomCard = () => (
    <TouchableOpacity
      onPress={meetRandomPeople}
      style={styles.randomCard}
      activeOpacity={0.9}
    >
      <View style={styles.randomIconWrap}>
        <Ionicons name="shuffle" size={22} color="white" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.randomTitle}>Meet Random People</Text>
        <Text style={styles.randomSub}>Discover students anywhere</Text>
      </View>

      {isFetching && isRandom ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SearchUser }) => {
    const isAddingThisUser =
      addFriendMutation.isPending &&
      addFriendMutation.variables?.targetUserId === item.id;

    const isDisabled = item.isFriends || item.hasSent || isAddingThisUser;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          {/* AVATAR */}
          <Image
            source={{
              uri: item.photos?.[0] || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />

          {/* INFO */}
          <View style={styles.info}>
            <Text style={styles.name}>
              {item.name}, {item.age}y
            </Text>

            <View style={styles.metaRow}>
              <Ionicons
                name="person-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{item.gender}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons
                name="school-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.college}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleView(item)}
          >
            <Ionicons name="eye-outline" size={16} color={colors.text} />
            <Text style={styles.viewText}>View profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addBtn,
              (item.isFriends || item.hasSent) && styles.friendsBtn,
            ]}
            onPress={() => handleAdd(item)}
            disabled={isDisabled}
          >
            {isAddingThisUser ? (
              <ActivityIndicator size="small" color="white" />
            ) : item.isFriends ? (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={styles.friendsText}>Friends</Text>
              </>
            ) : item.hasSent ? (
              <>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={styles.friendsText}>Requested</Text>
              </>
            ) : (
              <>
                <Ionicons name="person-add" size={16} color="white" />
                <Text style={styles.addText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const showEmptyState =
    !hasInteracted && query.trim().length === 0 && !isRandom;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* SEARCH BOX */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Meet new people on campus"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
        />
        {isFetching && !isRandom && (
          <ActivityIndicator size="small" color={colors.pink} />
        )}
      </View>

      {/* CONTENT SWITCHER */}
      {showEmptyState ? (
        <View style={styles.empty}>
          <Ionicons name="search" size={50} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Start discovering people</Text>
          <Text style={styles.emptySub}>Search or explore random students</Text>
          <TouchableOpacity
            style={styles.exploreShortcut}
            onPress={meetRandomPeople}
          >
            <Text style={styles.exploreShortcutText}>Roll Random Dice 🎲</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Text style={styles.loadingText}>Searching directory...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderRandomCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <Ionicons
                name="people-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your keywords or spelling
              </Text>
            </View>
          }
        />
      )}

      {/* DETAILED USER PROFILE MODAL */}
      <UserProfileModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </Animated.View>
  );
}
