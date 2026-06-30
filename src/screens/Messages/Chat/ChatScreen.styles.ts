import {
    StyleSheet,
    Dimensions,
} from "react-native";
;
import { colors, spacing, borderRadius } from "../../../lib/colors";

const { width } = Dimensions.get("window");

export const getStyles = (theme: any) => StyleSheet.create({
    chatViewportContainer: { flex: 1, backgroundColor: theme.background },
    centerSyncContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
    },
    syncFeedbackLabel: { marginTop: 12, fontSize: 14, color: theme.textMuted },
    messageListFeed: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md,
    },
    bubbleContainerRow: { width: "100%", marginBottom: spacing.xs },
    dateStickyHeaderView: {
        width: "100%",
        alignItems: "center",
        marginVertical: spacing.sm,
    },
    dateStickyHeaderText: {
        fontSize: 12,
        fontWeight: "600",
        color: theme.textMuted,
        backgroundColor: "rgba(255,255,255,0.03)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    bubbleWrapper: { width: "100%", flexDirection: "row" },
    myBubbleWrapper: { justifyContent: "flex-end" },
    theirBubbleWrapper: { justifyContent: "flex-start" },
    baseBubble: {
        maxWidth: width * 0.75,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    myBubbleBg: {
        backgroundColor: theme.primary || "#ec4899",
        borderBottomRightRadius: 2,
    },
    theirBubbleBg: {
        backgroundColor: theme.background,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: theme.border,
    },
    bubbleText: { fontSize: 15, color: "#ffffff", lineHeight: 20 },
    bubbleTimestamp: { fontSize: 10, marginTop: 4, textAlign: "right" },
    myTimeColor: { color: "rgba(255,255,255,0.7)" },
    theirTimeColor: { color: theme.textMuted },
    imageMediaContainer: {
        width: 200,
        height: 150,
        borderRadius: borderRadius.md,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    imageMediaFallback: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "#0a0b0e",
    },
    mediaOverlayLabel: {
        position: "absolute",
        color: theme.text,
        fontWeight: "600",
    },
    videoMediaPreview: {
        width: 200,
        height: 120,
        backgroundColor: "#0a0b0e",
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    videoDurationLabel: { color: theme.text, fontSize: 12, marginTop: 6 },
    mediaUploadingProgressStrip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary,
        paddingVertical: 6,
    },
    mediaProgressText: { color: "#ffffff", fontSize: 12, fontWeight: "500" },
});