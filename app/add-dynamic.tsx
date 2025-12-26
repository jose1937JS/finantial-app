import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { primaryColors, useSettingsStore } from '@/store/settings-store';

// Message types
type MessageType = 'text' | 'audio' | 'image' | 'system';
type MessageSender = 'user' | 'assistant';

interface ChatMessage {
    id: string;
    type: MessageType;
    content: string; // text content, base64 for image, or audio URI
    sender: MessageSender;
    timestamp: Date;
    audioDuration?: number;
}

// Initial system message
const initialMessages: ChatMessage[] = [
    {
        id: '1',
        type: 'system',
        content: '¡Hola! Soy tu asistente financiero. Puedes registrar una operación de las siguientes formas:\n\n📝 **Texto**: Escribe algo como "Gasté $50 en comida"\n\n🎤 **Voz**: Mantén presionado el micrófono y dicta tu operación\n\n📷 **Foto**: Envía una foto de tu recibo o factura',
        sender: 'assistant',
        timestamp: new Date(),
    },
];

export default function AddDynamicScreen() {
    const router = useRouter();
    const { preferences } = useSettingsStore();
    const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const [recordedAudio, setRecordedAudio] = useState<{ uri: string; duration: number } | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    // Use 'any' type to handle both NodeJS.Timeout and number (RN) return types
    const recordingTimerRef = useRef<any>(null);

    useEffect(() => {
        // Request audio permissions on mount
        (async () => {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
        })();

        return () => {
            // Cleanup
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        return newMessage;
    };

    const simulateAssistantResponse = (userMessage: ChatMessage) => {
        setIsProcessing(true);

        // Simulate AI processing delay
        setTimeout(() => {
            let responseContent = '';

            if (userMessage.type === 'text') {
                responseContent = `Entendido. He analizado tu mensaje:\n\n"${userMessage.content}"\n\n🔍 **Detectado:**\n• Tipo: Gasto\n• Monto: Por determinar\n• Categoría: Por determinar\n\n¿Deseas que registre esta operación? Puedes darme más detalles o confirmar.`;
            } else if (userMessage.type === 'audio') {
                responseContent = `🎤 He recibido tu mensaje de voz (${userMessage.audioDuration}s).\n\n⏳ Transcribiendo audio...\n\n_Esta función requiere conexión al backend de IA para procesar el audio._`;
            } else if (userMessage.type === 'image') {
                responseContent = `📷 He recibido la imagen.\n\n⏳ Analizando recibo/factura...\n\n_Esta función requiere conexión al backend de IA para procesar la imagen con OCR._`;
            }

            addMessage({
                type: 'text',
                content: responseContent,
                sender: 'assistant',
            });

            setIsProcessing(false);
        }, 1500);
    };

    const handleSendText = () => {
        if (!inputText.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMessage = addMessage({
            type: 'text',
            content: inputText.trim(),
            sender: 'user',
        });

        setInputText('');
        simulateAssistantResponse(userMessage);
    };

    const startRecording = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso al micrófono para grabar audio');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await recording.startAsync();

            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);

            // Start duration timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'No se pudo iniciar la grabación');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recordingRef.current) return;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Stop timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            const duration = recordingDuration;

            recordingRef.current = null;
            setIsRecording(false);
            setRecordingDuration(0);

            if (uri && duration > 0) {
                // Instead of sending immediately, set to preview state
                setRecordedAudio({ uri, duration });
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsRecording(false);
        }
    };

    const playRecordedAudio = async () => {
        if (!recordedAudio) return;

        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: recordedAudio.uri },
                    { shouldPlay: true }
                );

                setSound(newSound);
                setIsPlaying(true);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                        // Reset position
                        newSound.setPositionAsync(0);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing audio', error);
        }
    };

    const discardRecording = () => {
        if (sound) {
            sound.unloadAsync();
            setSound(null);
        }
        setRecordedAudio(null);
        setIsPlaying(false);
    };

    const sendRecording = () => {
        if (!recordedAudio) return;

        if (sound) {
            sound.unloadAsync();
            setSound(null);
        }

        const userMessage = addMessage({
            type: 'audio',
            content: recordedAudio.uri,
            sender: 'user',
            audioDuration: recordedAudio.duration,
        });

        simulateAssistantResponse(userMessage);

        setRecordedAudio(null);
        setIsPlaying(false);
    };

    const handlePickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Alert.alert(
            'Enviar Imagen',
            'Selecciona una opción',
            [
                {
                    text: 'Cámara',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu cámara');
                            return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 0.7,
                            base64: true,
                        });

                        if (!result.canceled && result.assets[0]) {
                            const asset = result.assets[0];
                            const base64Uri = asset.base64
                                ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
                                : asset.uri;

                            const userMessage = addMessage({
                                type: 'image',
                                content: base64Uri,
                                sender: 'user',
                            });

                            simulateAssistantResponse(userMessage);
                        }
                    }
                },
                {
                    text: 'Galería',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería');
                            return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            quality: 0.7,
                            base64: true,
                        });

                        if (!result.canceled && result.assets[0]) {
                            const asset = result.assets[0];
                            const base64Uri = asset.base64
                                ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
                                : asset.uri;

                            const userMessage = addMessage({
                                type: 'image',
                                content: base64Uri,
                                sender: 'user',
                            });

                            simulateAssistantResponse(userMessage);
                        }
                    }
                },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ... renderMessage code matches existing ...
    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isUser = item.sender === 'user';
        const isSystem = item.type === 'system';

        if (isSystem) {
            return (
                <View className="mx-4 my-2 p-4 bg-light-surface dark:bg-dark-surface rounded-2xl">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                        {item.content}
                    </Text>
                </View>
            );
        }

        return (
            <View className={`mx-4 my-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <View
                    className={`max-w-[80%] rounded-2xl p-3 ${isUser
                        ? 'rounded-br-sm'
                        : 'bg-white dark:bg-dark-card rounded-bl-sm'
                        }`}
                    style={isUser ? { backgroundColor: currentPrimaryColor } : undefined}
                >
                    {item.type === 'text' && (
                        <Text className={`text-base leading-5 ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {item.content}
                        </Text>
                    )}

                    {item.type === 'audio' && (
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name="play-circle"
                                size={32}
                                color={isUser ? '#fff' : currentPrimaryColor}
                            />
                            <View className="mx-3 flex-1 h-1 bg-white/30 rounded-full">
                                <View className="w-1/3 h-full bg-white rounded-full" />
                            </View>
                            <Text className={`text-sm ${isUser ? 'text-white/80' : 'text-gray-500'}`}>
                                {formatDuration(item.audioDuration || 0)}
                            </Text>
                        </View>
                    )}

                    {item.type === 'image' && (
                        <Image
                            source={{ uri: item.content }}
                            className="w-48 h-48 rounded-xl"
                            resizeMode="cover"
                        />
                    )}
                </View>
                <Text className="text-xs text-gray-400 mt-1 mx-1">
                    {item.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={100}
            >
                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />

                {/* Processing Indicator */}
                {isProcessing && (
                    <View className="mx-4 mb-2 items-start">
                        <View className="bg-white dark:bg-dark-card rounded-2xl rounded-bl-sm p-3 flex-row items-center">
                            <View className="flex-row gap-1">
                                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                            </View>
                            <Text className="text-sm text-gray-500 ml-2">Procesando...</Text>
                        </View>
                    </View>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                    <View className="mx-4 mb-2 p-4 bg-expense/10 rounded-2xl flex-row items-center justify-center">
                        <View className="w-3 h-3 rounded-full bg-expense mr-3 animate-pulse" />
                        <Text className="text-base font-semibold text-expense">
                            Grabando... {formatDuration(recordingDuration)}
                        </Text>
                    </View>
                )}

                {/* Input Area */}
                <View className="px-4 py-3 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border">
                    {recordedAudio ? (
                        // Audio Preview UI
                        <View className="flex-row items-center justify-between py-1">
                            <Pressable
                                onPress={discardRecording}
                                className="w-10 h-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                            >
                                <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                            </Pressable>

                            <View className="flex-1 flex-row items-center justify-center mx-4 bg-light-surface dark:bg-dark-surface rounded-full py-2 px-4 border border-light-border dark:border-dark-border">
                                <Pressable onPress={playRecordedAudio} className="mr-3">
                                    <MaterialCommunityIcons
                                        name={isPlaying ? "pause-circle" : "play-circle"}
                                        size={32}
                                        color={currentPrimaryColor}
                                    />
                                </Pressable>
                                <View className="flex-row items-center">
                                    <View className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-2 overflow-hidden">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: isPlaying ? '100%' : '0%', // Simplified progress
                                                backgroundColor: currentPrimaryColor
                                            }}
                                        />
                                    </View>
                                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                                        {formatDuration(recordedAudio.duration)}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={sendRecording}
                                className="w-11 h-11 items-center justify-center rounded-full"
                                style={{ backgroundColor: currentPrimaryColor }}
                            >
                                <MaterialCommunityIcons name="send" size={22} color="#fff" />
                            </Pressable>
                        </View>
                    ) : (
                        // Standard Input UI
                        <View className="flex-row items-end gap-2">
                            {/* Image Button */}
                            <Pressable
                                onPress={handlePickImage}
                                className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                disabled={isRecording}
                            >
                                <MaterialCommunityIcons
                                    name="image"
                                    size={24}
                                    color={isRecording ? '#9ca3af' : '#6b7280'}
                                />
                            </Pressable>

                            {/* Text Input */}
                            <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-3xl px-4 py-2 min-h-[44px] max-h-[120px] justify-center">
                                <TextInput
                                    className="text-base text-gray-900 dark:text-white"
                                    placeholder="Escribe un mensaje..."
                                    placeholderTextColor="#9ca3af"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    editable={!isRecording}
                                />
                            </View>

                            {/* Send / Mic Button */}
                            {inputText.trim() ? (
                                <Pressable
                                    onPress={handleSendText}
                                    className="w-11 h-11 rounded-full items-center justify-center"
                                    style={{ backgroundColor: currentPrimaryColor }}
                                >
                                    <MaterialCommunityIcons name="send" size={22} color="#fff" />
                                </Pressable>
                            ) : (
                                <TouchableOpacity
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform: [{ scale: isRecording ? 1.25 : 1 }],
                                        backgroundColor: isRecording ? '#ef4444' : currentPrimaryColor
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name={isRecording ? 'stop' : 'microphone'}
                                        size={22}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
