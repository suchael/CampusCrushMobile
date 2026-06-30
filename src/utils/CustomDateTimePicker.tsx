import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "@/lib/colors";
import { useTheme } from "@/lib/context/theme-context";

interface CustomDateTimePickerProps {
  date: string | null;
  setDate: (date: string) => void;
}

const ALL_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

// Fixed mathematical dimensions for exact scroll alignment
const DAY_ITEM_STEP = 44 + 8; // width (44) + gap (8)
const TIME_ITEM_STEP = 38; // exact explicit row height

export default function CustomDateTimePicker({
  date,
  setDate,
}: CustomDateTimePickerProps) {
  const { theme } = useTheme();
    const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);

  // Scroll View Layout References
  const dayScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Core anchor moments derived dynamically (Target Year: 2026)
  const now = useMemo(() => new Date(), [modalVisible]);
  const maxDate = useMemo(
    () => new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    [now],
  );

  // Picker States
  const [selectedMonth, setSelectedMonth] = useState(
    ALL_MONTHS[now.getMonth()],
  );
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  // Edge Case 1: Compute only permitted months spanning across the 30-day window
  const allowedMonths = useMemo(() => {
    const startMonth = now.getMonth();
    const endMonth = maxDate.getMonth();

    if (startMonth === endMonth) {
      return [ALL_MONTHS[startMonth]];
    }
    return [ALL_MONTHS[startMonth], ALL_MONTHS[endMonth]];
  }, [now, maxDate]);

  // Edge Case 2: Deduce correct targeted year dynamically (Handles December -> January transition)
  const targetYear = useMemo(() => {
    const monthIdx = ALL_MONTHS.indexOf(selectedMonth);
    if (monthIdx < now.getMonth()) {
      return now.getFullYear() + 1;
    }
    return now.getFullYear();
  }, [selectedMonth, now]);

  // Edge Case 3: Calculate day boundaries dynamically depending on selected month context
  const daysArray = useMemo(() => {
    const monthIdx = ALL_MONTHS.indexOf(selectedMonth);
    let startDay = 1;
    let endDay = new Date(targetYear, monthIdx + 1, 0).getDate();

    if (monthIdx === now.getMonth() && targetYear === now.getFullYear()) {
      startDay = now.getDate(); // Forward facing only
    }
    if (
      monthIdx === maxDate.getMonth() &&
      targetYear === maxDate.getFullYear()
    ) {
      endDay = maxDate.getDate(); // Cap at 30 days forward max
    }

    const days = [];
    for (let i = startDay; i <= endDay; i++) {
      days.push(i);
    }
    return days;
  }, [selectedMonth, targetYear, now, maxDate]);

  // Initialize, synchronize picker states, and handle auto-scroll execution upon modal launch
  useEffect(() => {
    if (modalVisible) {
      const initialDate = date ? new Date(date) : new Date();
      const finalInitDate =
        initialDate.getTime() < now.getTime() ||
        initialDate.getTime() > maxDate.getTime()
          ? now
          : initialDate;

      const currentMonthStr = ALL_MONTHS[finalInitDate.getMonth()];
      const currentDay = finalInitDate.getDate();

      let rawHour = finalInitDate.getHours();
      const period = rawHour >= 12 ? "PM" : "AM";
      let displayHour = rawHour % 12;
      if (displayHour === 0) displayHour = 12;
      const targetHourStr = String(displayHour).padStart(2, "0");

      const roundedMinutes = Math.round(finalInitDate.getMinutes() / 5) * 5;
      const targetMinStr = String(
        roundedMinutes >= 60 ? 55 : roundedMinutes,
      ).padStart(2, "0");

      setSelectedMonth(currentMonthStr);
      setSelectedDay(currentDay);
      setSelectedHour(targetHourStr);
      setSelectedMinute(targetMinStr);
      setSelectedPeriod(period);

      // Programmatic scroll execution delayed slightly to allow native layouts to settle down
      setTimeout(() => {
        // 1. Position Day Stream
        const computedDaysArray = [];
        const monthIdx = ALL_MONTHS.indexOf(currentMonthStr);
        let sDay = monthIdx === now.getMonth() ? now.getDate() : 1;
        let eDay = new Date(targetYear, monthIdx + 1, 0).getDate();
        if (monthIdx === maxDate.getMonth()) eDay = maxDate.getDate();
        for (let i = sDay; i <= eDay; i++) computedDaysArray.push(i);

        const dayIdx = computedDaysArray.indexOf(currentDay);
        if (dayIdx !== -1 && dayScrollRef.current) {
          dayScrollRef.current.scrollTo({
            x: dayIdx * DAY_ITEM_STEP,
            animated: false,
          });
        }

        // 2. Position Hour Track
        const hourIdx = HOURS.indexOf(targetHourStr);
        if (hourIdx !== -1 && hourScrollRef.current) {
          hourScrollRef.current.scrollTo({
            y: hourIdx * TIME_ITEM_STEP,
            animated: false,
          });
        }

        // 3. Position Minute Track
        const minIdx = MINUTES.indexOf(targetMinStr);
        if (minIdx !== -1 && minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({
            y: minIdx * TIME_ITEM_STEP,
            animated: false,
          });
        }
      }, 120);
    }
  }, [modalVisible]);

  // Safety guard rail to re-align out-of-bounds days when flipping months manually
  useEffect(() => {
    if (daysArray.length > 0 && !daysArray.includes(selectedDay)) {
      setSelectedDay(daysArray[0]);
      if (dayScrollRef.current) {
        dayScrollRef.current.scrollTo({ x: 0, animated: true });
      }
    }
  }, [selectedMonth, daysArray]);

  // Construct current selection representation instantly
  const liveSelectedDateObject = useMemo(() => {
    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === "PM" && hour24 < 12) hour24 += 12;
    if (selectedPeriod === "AM" && hour24 === 12) hour24 = 0;

    return new Date(
      targetYear,
      ALL_MONTHS.indexOf(selectedMonth),
      selectedDay,
      hour24,
      parseInt(selectedMinute, 10),
    );
  }, [
    selectedMonth,
    selectedDay,
    selectedHour,
    selectedMinute,
    selectedPeriod,
    targetYear,
  ]);

  // Time safety valuation check (Checks if targeted config is in the past)
  const isTimeInPast = useMemo(() => {
    return liveSelectedDateObject.getTime() < now.getTime();
  }, [liveSelectedDateObject, now]);

  const handleSaveSelection = () => {
    if (isTimeInPast) return;
    setDate(liveSelectedDateObject.toISOString());
    setModalVisible(false);
  };

  const formatTextDisplay = (targetDate: Date | null, placeholder: string) => {
    if (!targetDate) return placeholder;
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = weekdays[targetDate.getDay()];
    const month = ALL_MONTHS[targetDate.getMonth()];
    const day = targetDate.getDate();
    let hours = targetDate.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = String(targetDate.getMinutes()).padStart(2, "0");
    return `${dayName}, ${month} ${day} • ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Date <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={theme.textMuted}
          style={styles.inputIcon}
        />
        <Text style={[styles.triggerText, !date && styles.placeholderText]}>
          {date
            ? formatTextDisplay(new Date(date), "")
            : "Select Date and Time"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={theme.textMuted}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.absoluteBackdrop}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="time-outline" size={20} color={theme.pink} />
                <Text style={styles.modalTitle}>Select Event Date and Time</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* SECTION: MONTHS */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionLabel}>Select Month</Text>
                <View style={styles.horizontalChips}>
                  {allowedMonths.map((m) => {
                    const isSelected = selectedMonth === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        activeOpacity={0.8}
                        onPress={() => setSelectedMonth(m)}
                        style={[
                          styles.chipPill,
                          isSelected && styles.chipPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION: DAYS */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionLabel}>Select Day</Text>
                <ScrollView
                  ref={dayScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalChips}
                >
                  {daysArray.map((d) => {
                    const isSelected = selectedDay === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        activeOpacity={0.8}
                        onPress={() => setSelectedDay(d)}
                        style={[
                          styles.daySquare,
                          isSelected && styles.chipPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* SECTION: TIME METRIC SCROLLERS */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionLabel}>Set Time</Text>
                <View style={styles.timePickerContainer}>
                  {/* Hours Scroller Column */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnLabel}>Hour</Text>
                    <ScrollView
                      ref={hourScrollRef}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={styles.verticalScrollContainer}
                    >
                      {HOURS.map((h) => {
                        const isSelected = selectedHour === h;
                        return (
                          <TouchableOpacity
                            key={h}
                            onPress={() => setSelectedHour(h)}
                            style={[
                              styles.verticalTimeRow,
                              isSelected && styles.verticalTimeRowActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeRowText,
                                isSelected && styles.timeRowTextActive,
                              ]}
                            >
                              {h}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <Text style={styles.timeDivider}>:</Text>

                  {/* Minutes Scroller Column */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnLabel}>Min</Text>
                    <ScrollView
                      ref={minuteScrollRef}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={styles.verticalScrollContainer}
                    >
                      {MINUTES.map((m) => {
                        const isSelected = selectedMinute === m;
                        return (
                          <TouchableOpacity
                            key={m}
                            onPress={() => setSelectedMinute(m)}
                            style={[
                              styles.verticalTimeRow,
                              isSelected && styles.verticalTimeRowActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeRowText,
                                isSelected && styles.timeRowTextActive,
                              ]}
                            >
                              {m}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <View style={styles.periodToggleWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedPeriod("AM")}
                      style={[
                        styles.periodButton,
                        selectedPeriod === "AM" && styles.periodButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selectedPeriod === "AM" &&
                            styles.periodButtonTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedPeriod("PM")}
                      style={[
                        styles.periodButton,
                        selectedPeriod === "PM" && styles.periodButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selectedPeriod === "PM" &&
                            styles.periodButtonTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* LIVE SELECTION & ERROR FEEDBACK ROW */}
              <View
                style={[
                  styles.livePreviewContainer,
                  isTimeInPast && styles.livePreviewContainerError,
                ]}
              >
                <Ionicons
                  name={isTimeInPast ? "alert-circle-outline" : "eye-outline"}
                  size={16}
                  color={isTimeInPast ? "#EF4444" : theme.pink}
                />
                <Text
                  style={[
                    styles.livePreviewText,
                    isTimeInPast && styles.livePreviewTextError,
                  ]}
                >
                  {isTimeInPast
                    ? "Selected time cannot be in the past"
                    : formatTextDisplay(liveSelectedDateObject, "")}
                </Text>
              </View>

              {/* ACTION CONFIRM BUTTON BRIDGE */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.confirmButton,
                  isTimeInPast && styles.confirmButtonDisabled,
                ]}
                onPress={handleSaveSelection}
                disabled={isTimeInPast}
              >
                <Text style={styles.confirmButtonText}>Confirm Selection</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="white"
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    width: "100%",
  },
   label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginLeft: 2,
  },
  requiredAsterisk: {
    color: theme.pink,
    fontWeight: "bold",
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 6,

  },
  inputIcon: {
    paddingLeft: 2,
    marginRight: 10,
  },
  chevronIcon: {
    paddingRight: 4,
  },
  triggerText: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },
  placeholderText: {
    color: theme.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    justifyContent: "center",
  },
  absoluteBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: theme.surface,
   borderRadius: 30,
    maxHeight: "80%",
    width: "100%",
    borderWidth: 1,
    borderColor: theme.border,
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 6,
    borderRadius: borderRadius.full,
  },
  scrollBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 45 : 35,
    gap: 20,
  },
  sectionGroup: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 2,
  },
  horizontalChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chipPill: {
    backgroundColor: theme.background,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  daySquare: {
    backgroundColor: theme.background,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  chipPillActive: {
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    borderColor: theme.pink,
  },
  chipText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: theme.pink,
    fontWeight: "700",
  },
  timePickerContainer: {
    flexDirection: "row",
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  timeColumn: {
    flex: 1,
    alignItems: "center",
    height: 140,
  },
  timeColumnLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  verticalScrollContainer: {
    width: "100%",
    flex: 1,
  },
  verticalTimeRow: {
    width: "100%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.sm,
    marginVertical: 1,
  },
  verticalTimeRowActive: {
    backgroundColor: "rgba(236, 72, 153, 0.15)",
  },
  timeRowText: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  timeRowTextActive: {
    color: theme.pink,
    fontWeight: "700",
  },
  timeDivider: {
    fontSize: 20,
    color: theme.textMuted,
    fontWeight: "700",
    paddingHorizontal: 8,
    bottom: -6,
  },
  periodToggleWrapper: {
    gap: 6,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.06)",
  },
  periodButton: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: theme.pink,
    borderColor: theme.pink,
  },
  periodButtonText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  periodButtonTextActive: {
    color: "white",
  },
  livePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(236, 72, 153, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.15)",
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginTop: 4,
  },
  livePreviewContainerError: {
    backgroundColor: "rgba(239, 68, 68, 0.06)",
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  livePreviewText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  livePreviewTextError: {
    color: "#EF4444",
  },
  confirmButton: {
    backgroundColor: theme.pink,
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});
