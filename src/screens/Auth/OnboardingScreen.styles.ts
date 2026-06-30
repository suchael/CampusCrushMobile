import {
    StyleSheet,
} from "react-native";

import { colors, spacing, borderRadius } from "../../lib/colors";


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 60,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    progressBar: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing.sm,
    },
    progressDot: {
        width: 60,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
    },
    progressDotActive: {
        backgroundColor: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    stepContent: {
        gap: spacing.lg,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.text,
    },
    stepSubtitle: {
        fontSize: 16,
        color: colors.text,
        marginTop: -spacing.sm,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        color: colors.text,
        fontSize: 16,
        justifyContent: "center", // Ensures clear alignment vertical rendering inside choice containers
        minHeight: 52,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    chipContainer: {
        flexDirection: "row",
    },
    chipGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    goalChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    chipTextSelected: {
        color: colors.text,
        fontWeight: "600",
    },
    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    photoSlot: {
        width: "31%",
        aspectRatio: 3 / 4,
        borderRadius: borderRadius.md,
        overflow: "hidden",
    },
    photoPlaceholder: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: "dashed",
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    photo: {
        width: "100%",
        height: "100%",
    },
    footerSafeArea: {
        width: "100%",
    },
    footer: {
        flexDirection: "row",
        padding: spacing.lg,
        gap: spacing.md,
    },
    backButton: {
        width: 50,
        height: 50,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    nextButton: {
        flex: 1,
        borderRadius: borderRadius.md,
        overflow: "hidden",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    gradientButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.md,
        gap: spacing.sm,
        minHeight: 50,
    },
    buttonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "600",
    },
});