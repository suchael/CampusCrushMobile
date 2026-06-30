import {
  StyleSheet,
  Platform,
} from "react-native";

import { spacing, borderRadius } from "@/lib/colors";


export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  screenHeader: {
    marginBottom: spacing.sm,
  },
  screenHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  screenHeaderSub: {
    fontSize: 15,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  tierContainer: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  tierCard: {
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tierMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tierMetaSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  tierTitleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  priceContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  tierPriceTag: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  tierFeatureText: {
    fontSize: 13,
    lineHeight: 19,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  rowIconContainer: {
    width: 36,
    alignItems: "flex-start",
  },
  rowTextSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowDescription: {
    fontSize: 12,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});