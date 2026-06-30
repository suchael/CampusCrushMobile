import {
    StyleSheet,
} from "react-native";
import { colors, spacing, borderRadius } from "@/lib/colors";

export const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: spacing.md,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "900",
        color: theme.text,
    },
    subtitle: {
        color: theme.textMuted,
        marginTop: 4,
        marginBottom: spacing.md,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: theme.surface,
        borderRadius: borderRadius.lg,
        padding: 4,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: borderRadius.md,
    },
    activeTabButton: {
        backgroundColor: theme.surfaceLight,
        borderWidth: 1,
        borderColor: theme.border,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.textMuted,
    },
    activeTabText: {
        color: theme.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    list: {
        paddingBottom: 100,
    },
    card: {
        flexDirection: "row",
        backgroundColor: theme.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: spacing.md,
        backgroundColor: theme.surfaceLight,
    },
    info: {
        flex: 1,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    name: {
        color: theme.text,
        fontSize: 16,
        fontWeight: "800",
    },
    time: {
        color: theme.textMuted,
        fontSize: 12,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 3,
    },
    school: {
        color: theme.textMuted,
        fontSize: 12,
        flex: 1,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
    },
    tagText: {
        color: theme.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        marginTop: spacing.md,
        gap: 10,
    },
    acceptBtn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.primary,
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        gap: 6,
    },
    acceptText: {
        color: "white",
        fontWeight: "700",
    },
    declineBtn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.surfaceLight,
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        gap: 6,
    },
    declineText: {
        color: theme.error,
        fontWeight: "700",
    },
    cancelBtn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.surfaceLight,
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        gap: 6,
        borderWidth: 1,
        borderColor: theme.border,
    },
    cancelText: {
        color: theme.textMuted,
        fontWeight: "700",
    },
    empty: {
        alignItems: "center",
        marginTop: 100,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        color: theme.text,
        fontSize: 16,
        fontWeight: "800",
        marginTop: 10,
    },
    emptySub: {
        color: theme.textMuted,
        textAlign: "center",
        marginTop: 6,
        fontSize: 14,
    },
});