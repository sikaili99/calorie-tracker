import React, { useRef, useState, useCallback } from "react"
import {
	View,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { readAsStringAsync } from "expo-file-system"
import * as ImageManipulator from "expo-image-manipulator"
import { router, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function PhotoLogger() {
	const theme = useThemeColor()
	const [permission, requestPermission] = useCameraPermissions()
	const [isTaking, setIsTaking] = useState(false)
	const cameraRef = useRef<CameraView>(null)
	const params = useLocalSearchParams<{ meal?: string }>()
	const meal = Number(params.meal ?? 0)

	const handleCapture = useCallback(async () => {
		if (!cameraRef.current || isTaking) return
		setIsTaking(true)

		try {
			const photo = await cameraRef.current.takePictureAsync({ base64: false })
			if (!photo?.uri) return

			// Compress to reduce payload size
			const compressed = await ImageManipulator.manipulateAsync(
				photo.uri,
				[{ resize: { width: 800 } }],
				{ compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
			)

			const base64 = await readAsStringAsync(compressed.uri, {
				encoding: "base64",
			})

			router.replace({
				pathname: "/photoLogReview",
				params: { imageBase64: base64, meal: meal.toString() },
			})
		} catch {
			setIsTaking(false)
		}
	}, [isTaking, meal])

	const styles = StyleSheet.create({
		container: { flex: 1, backgroundColor: "#000" },
		camera: { flex: 1 },
		topBar: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			flexDirection: "row",
			alignItems: "center",
			padding: 16,
			zIndex: 10,
		},
		closeButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: "rgba(0,0,0,0.5)",
			justifyContent: "center",
			alignItems: "center",
		},
		bottomBar: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			alignItems: "center",
			paddingBottom: 48,
			paddingTop: 24,
			gap: 12,
		},
		captureButton: {
			width: 72,
			height: 72,
			borderRadius: 36,
			backgroundColor: "#fff",
			justifyContent: "center",
			alignItems: "center",
			borderWidth: 4,
			borderColor: "rgba(255,255,255,0.5)",
		},
		hint: {
			color: "#fff",
			textAlign: "center",
			opacity: 0.8,
		},
		permissionContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: theme.background,
			gap: 16,
			padding: 32,
		},
		permissionButton: {
			backgroundColor: theme.primary,
			borderRadius: 12,
			paddingHorizontal: 24,
			paddingVertical: 12,
		},
	})

	if (!permission) return null

	if (!permission.granted) {
		return (
			<SafeAreaView style={styles.permissionContainer}>
				<Ionicons name="camera-outline" size={60} color={theme.onSurface} />
				<ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
					Camera access is needed to log meals from photos
				</ThemedText>
				<TouchableOpacity
					style={styles.permissionButton}
					onPress={requestPermission}
				>
					<ThemedText type="defaultSemiBold" color={theme.background}>
						Grant Permission
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.back()}>
					<ThemedText type="subtitleLight">Go back</ThemedText>
				</TouchableOpacity>
			</SafeAreaView>
		)
	}

	return (
		<View style={styles.container}>
			<CameraView ref={cameraRef} style={styles.camera} facing="back" />

			<View style={styles.topBar}>
				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => router.back()}
				>
					<Ionicons name="close" size={24} color="#fff" />
				</TouchableOpacity>
			</View>

			<View style={styles.bottomBar}>
				<ThemedText style={styles.hint}>
					Point at your meal and tap to capture
				</ThemedText>
				<TouchableOpacity
					style={styles.captureButton}
					onPress={handleCapture}
					disabled={isTaking}
				>
					{isTaking ? (
						<ActivityIndicator size="small" color="#000" />
					) : (
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 28,
								backgroundColor: "#fff",
							}}
						/>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}
