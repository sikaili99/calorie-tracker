import React, { useMemo } from "react"
import { View, StyleSheet } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { ChatMessage } from "@/api/BackendAPI"

interface MessageBubbleProps {
	message: ChatMessage
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
	const theme = useThemeColor()
	const isUser = message.role === "user"

	const styles = useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					justifyContent: isUser ? "flex-end" : "flex-start",
					marginVertical: 4,
					paddingHorizontal: 16,
				},
				bubble: {
					maxWidth: "80%",
					borderRadius,
					padding: 12,
					backgroundColor: isUser ? theme.primary : theme.surface,
				},
				text: {
					color: isUser ? theme.background : theme.text,
					fontSize: 15,
					lineHeight: 22,
				},
			}),
		[theme, isUser]
	)

	return (
		<View style={styles.row}>
			<View style={styles.bubble}>
				<ThemedText style={styles.text}>{message.content}</ThemedText>
			</View>
		</View>
	)
}
