import React, { useMemo, useState, useCallback } from "react"
import {
	View,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

interface ChatInputProps {
	onSend: (text: string) => void
	isLoading: boolean
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
	const theme = useThemeColor()
	const [text, setText] = useState("")

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flexDirection: "row",
					alignItems: "flex-end",
					paddingHorizontal: 16,
					paddingVertical: 10,
					backgroundColor: theme.surface,
					gap: 8,
					borderTopWidth: StyleSheet.hairlineWidth,
					borderTopColor: theme.onSurface,
				},
				inputWrapper: {
					flex: 1,
					backgroundColor: theme.background,
					borderRadius,
					paddingHorizontal: 14,
					paddingVertical: 10,
					minHeight: 44,
					justifyContent: "center",
					borderWidth: 1,
					borderColor: theme.onSurface,
				},
				input: {
					color: theme.text,
					fontSize: 15,
					maxHeight: 120,
					paddingVertical: 0,
				},
				sendButton: {
					width: 44,
					height: 44,
					borderRadius: 22,
					backgroundColor: theme.primary,
					alignItems: "center",
					justifyContent: "center",
				},
				sendButtonDisabled: {
					backgroundColor: theme.onSurface,
				},
			}),
		[theme]
	)

	const canSend = text.trim().length > 0 && !isLoading

	const handleSend = useCallback(() => {
		if (!canSend) return
		onSend(text.trim())
		setText("")
	}, [text, canSend, onSend])

	return (
		<View style={styles.container}>
			<View style={styles.inputWrapper}>
				<TextInput
					style={styles.input}
					value={text}
					onChangeText={setText}
					placeholder="Ask your nutrition coach…"
					placeholderTextColor={`${theme.text}66`}
					multiline
					returnKeyType="default"
				/>
			</View>
			<TouchableOpacity
				style={[
					styles.sendButton,
					!canSend && styles.sendButtonDisabled,
				]}
				onPress={handleSend}
				disabled={!canSend}
			>
				{isLoading ? (
					<ActivityIndicator color={theme.background} size="small" />
				) : (
					<Ionicons
						name="send"
						size={18}
						color={canSend ? theme.background : theme.text}
					/>
				)}
			</TouchableOpacity>
		</View>
	)
}
