
import { StyleSheet } from "react-native";
import { colors, spacing, borderRadius } from "../../lib/colors";


export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: "center",
    },

    backButton: {
        position: "absolute",
        top: 60,
        left: 20,
        zIndex: 100,
    },

    stepLabel: {
        color: colors.textMuted,
        textAlign: "center",
        marginBottom: 10,
        marginTop: 40,
    },

    progressContainer: {
        height: 8,
        backgroundColor: colors.surface,
        borderRadius: 50,
        overflow: "hidden",
        marginBottom: 30,
    },

    progressFill: {
        height: "100%",
        backgroundColor: colors.primary,
    },

    content: {
        alignItems: "center",
    },

    iconWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.success,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.text,
        marginBottom: 10,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 15,
        color: colors.textMuted,
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 22,
    },

    emailText: {
        color: colors.primary,
        fontWeight: "700",
        marginBottom: 25,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 15,
        marginBottom: 15,
        width: "100%",
    },

    inputIcon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        color: colors.text,
        paddingVertical: 16,
        fontSize: 16,
    },

    otpContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },

    otpInput: {
        width: 50,
        height: 60,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
    },

    timer: {
        color: colors.textMuted,
        marginBottom: 10,
        fontWeight: "600",
    },

    resendText: {
        color: colors.primary,
        fontWeight: "700",
        marginBottom: 20,
    },

    primaryButton: {
        width: "100%",
        marginTop: 10,
        borderRadius: borderRadius.lg,
        overflow: "hidden",
    },

    buttonGradient: {
        minHeight: 56,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});