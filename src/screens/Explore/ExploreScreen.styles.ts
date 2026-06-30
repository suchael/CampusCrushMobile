import { StyleSheet, Dimensions } from "react-native";
import { colors, spacing, borderRadius } from "../../lib/colors";

const { width } = Dimensions.get("window");

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 24,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
    gap: spacing.lg, // Native spacing between cards
  },
  
  // --- Modern Bento Card Styling ---
  card: {
    width: "100%",
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: 8, // Internal padding to create the bento separation
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    // Neomorphic / high-fidelity shadow logic
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  floatingTopRow: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateBadge: {
    backgroundColor: theme.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  dateBadgeText: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  cardContent: {
    padding: spacing.sm,
    paddingTop: spacing.md,
  },
  cardCategory: {
    color: theme.pink,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: theme.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    gap: 8,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 45, 85, 0.1)", // Light pink background for icons
    justifyContent: "center",
    alignItems: "center",
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  primaryAction: {
    backgroundColor: theme.pink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: 1,
  },
  primaryActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  
  // --- States ---
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});