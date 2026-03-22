import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    createAudioPlayer,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

import { AiService } from '@/api/services/ai.service';
import { TransactionService } from '@/api/services/transaction.service';
import { CustomHeader } from '@/components/ui/custom-header';
import { useAlert } from '@/hooks/alert-context';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';

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
        content: '¡Hola! Soy tu asistente financiero. Puedes registrar una operación de las siguientes formas:\n\n📝 **Texto**: Escribe algo como "Gasté $50 en comida"\n\n🎤 **Voz**: Presiona el micrófono y dicta tu operación\n\n📷 **Foto**: Envía una foto de tu recibo o factura',
        sender: 'assistant',
        timestamp: new Date(),
    },
];

export default function AddDynamicScreen() {
    const { preferences } = useSettingsStore();
    const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';
    const { showAlert } = useAlert();
    const { addTransaction } = useTransactionStore();
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    // Expo Audio Hooks
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderStatus = useAudioRecorderState(recorder);
    const [recordedAudio, setRecordedAudio] = useState<{ uri: string; duration: number } | null>(null);
    const isRecordingRef = useRef(false);
    const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    // Input mode: 'voice' (default) or 'text'
    type InputMode = 'voice' | 'text';
    const [inputMode, setInputMode] = useState<InputMode>('voice');
    const [isPreparing, setIsPreparing] = useState(false);

    // Create player when recordedAudio changes
    useEffect(() => {
        if (recordedAudio?.uri) {
            // Limpiar player anterior
            if (playerRef.current) {
                playerRef.current.remove();
                playerRef.current = null;
            }

            // Crear nuevo player con la URI grabada
            const newPlayer = createAudioPlayer(recordedAudio.uri);
            playerRef.current = newPlayer;
            setAudioError(null);
            setIsPlaying(false);
            setPlaybackProgress(0);

            console.log('Player created for URI:', recordedAudio.uri);
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.remove();
                playerRef.current = null;
            }
        };
    }, [recordedAudio?.uri]);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Request audio permissions and set initial mode
        (async () => {
            try {
                const { granted } = await requestRecordingPermissionsAsync();
                if (granted) {
                    await setAudioModeAsync({
                        allowsRecording: true,
                        playsInSilentMode: true,
                    });
                }
            } catch (err) {
                console.error('Error setting audio mode', err);
            }
        })();

        return () => {
            // Usar try-catch para evitar errores si el objeto nativo ya fue destruido
            try {
                if (isRecordingRef.current) {
                    recorder.stop();
                }
            } catch (e) {
                // El recorder ya fue destruído, ignorar
                console.log('Recorder cleanup: already disposed');
            }
        };
    }, []);

    // Effect to handle duration timer during recording
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            setRecordingDuration(0);
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

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

    const handleAiResponse = (aiData: any, userMessage: ChatMessage) => {
        // Store for later confirmation via 'confirmar' keyword
        lastAiDataRef.current = aiData;

        // Build a human-readable summary of the detected transaction
        const type = aiData.type ?? 'expense';
        const amount = aiData.amount ?? '?';
        const currency = aiData.currency ?? 'USD';
        const description = aiData.description ?? '';
        const category = aiData.category_id ?? aiData.category ?? '';

        const typeLabel = type === 'income' ? 'Ingreso' : type === 'loan' ? 'Pr\u00e9stamo' : 'Gasto';
        const responseContent = `✅ **Transacci\u00f3n detectada:**\n\n• Tipo: ${typeLabel}\n• Monto: ${currency} ${amount}\n• Descripci\u00f3n: ${description || 'N/A'}\n• Categor\u00eda: ${category || 'N/A'}\n\n¿Deseas confirmar y registrar esta operaci\u00f3n?`;

        const assistantMessage = addMessage({
            type: 'text',
            content: responseContent,
            sender: 'assistant',
        });

        // Store the transaction data for confirmation
        (assistantMessage as any).__pendingTransaction = aiData;

        // After adding response, give user a way to confirm
        setTimeout(() => {
            addMessage({
                type: 'system',
                content: '⤵ Responde “confirmar” para guardar esta transacci\u00f3n, o escribe algo para continuar.',
                sender: 'assistant',
            });
        }, 300);
    };

    const callAiAndRespond = async (userMessage: ChatMessage) => {
        setIsProcessing(true);
        try {
            let aiData: any;

            if (userMessage.type === 'text') {
                aiData = await AiService.analyzeText(userMessage.content);
            } else if (userMessage.type === 'audio') {
                // Build FormData for audio
                const formData = new FormData();
                formData.append('audio', {
                    uri: userMessage.content,
                    name: 'recording.m4a',
                    type: 'audio/m4a',
                } as any);
                aiData = await AiService.analyzeAudio(formData);
            } else if (userMessage.type === 'image') {
                // Build FormData for image (content is base64 data URI)
                const formData = new FormData();
                formData.append('image', {
                    uri: userMessage.content,
                    name: 'photo.jpg',
                    type: 'image/jpeg',
                } as any);
                aiData = await AiService.analyzeImage(formData);
            }

            if (aiData) {
                handleAiResponse(aiData, userMessage);
            } else {
                addMessage({
                    type: 'text',
                    content: 'No pude analizar el contenido. Por favor intenta de nuevo.',
                    sender: 'assistant',
                });
            }
        } catch (error: any) {
            console.error('AI analyze error:', error);
            addMessage({
                type: 'text',
                content: `⚠️ Error al procesar: ${error?.message ?? 'Sin conexi\u00f3n al servidor'}. Por favor verifica tu conexi\u00f3n.`,
                sender: 'assistant',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmTransaction = async (aiData: any) => {
        try {
            setIsProcessing(true);
            const dto = {
                amount: Number(aiData.amount ?? 0),
                description: aiData.description ?? '',
                currency: aiData.currency ?? 'USD',
                date: aiData.date ?? new Date().toISOString(),
                type: aiData.type ?? 'expense',
                category_id: aiData.category_id ?? undefined,
            };
            await TransactionService.create(dto);
            // Also add locally to store
            await addTransaction({
                type: dto.type,
                amount: dto.amount,
                currency: dto.currency as any,
                category: String(aiData.category ?? aiData.category_id ?? 'Otros'),
                description: dto.description,
                date: dto.date,
            });
            addMessage({
                type: 'text',
                content: '✅ ¡Transacci\u00f3n registrada exitosamente! Puedes verla en tu historial.',
                sender: 'assistant',
            });
        } catch (err: any) {
            addMessage({
                type: 'text',
                content: `❌ No se pudo guardar la transacci\u00f3n: ${err?.message ?? 'Error del servidor'}`,
                sender: 'assistant',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Last pending AI data
    const lastAiDataRef = useRef<any>(null);

    const simulateAssistantResponse = (userMessage: ChatMessage) => {
        callAiAndRespond(userMessage);
    };

    const handleSendText = () => {
        if (!inputText.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const text = inputText.trim();
        setInputText('');

        // Allow user to confirm a pending transaction by typing 'confirmar'
        if (text.toLowerCase() === 'confirmar' || text.toLowerCase() === 'confirm') {
            addMessage({ type: 'text', content: text, sender: 'user' });
            if (lastAiDataRef.current) {
                confirmTransaction(lastAiDataRef.current);
            } else {
                addMessage({
                    type: 'text',
                    content: 'No hay una transacci\u00f3n pendiente de confirmaci\u00f3n.',
                    sender: 'assistant',
                });
            }
            return;
        }

        const userMessage = addMessage({
            type: 'text',
            content: text,
            sender: 'user',
        });

        simulateAssistantResponse(userMessage);
    };

    const startRecording = async () => {
        if (isRecording || isPreparing) return;

        try {
            console.log('--- MIC START ---');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Mostrar feedback de preparación inmediatamente
            setIsPreparing(true);
            setAudioError(null);

            const { granted } = await requestRecordingPermissionsAsync();
            if (!granted) {
                setIsPreparing(false);
                showAlert({ title: 'Permisos necesarios', message: 'Necesitamos acceso al micrófono para grabar audio', icon: 'microphone-off', iconColor: '#f59e0b' });
                return;
            }

            // Force audio mode for recording
            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
                shouldPlayInBackground: false,
            });

            // CRÍTICO: Preparar el recorder antes de grabar
            await recorder.prepareToRecordAsync();

            // Esperar a que el recorder esté completamente listo
            await new Promise(resolve => setTimeout(resolve, 150));

            // Ahora sí empezar a grabar
            recorder.record();

            setIsPreparing(false);
            setIsRecording(true);
            isRecordingRef.current = true;
            console.log('Recorder.record() called');
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsPreparing(false);
            setIsRecording(false);
            isRecordingRef.current = false;
            showAlert({ title: 'Error', message: 'No se pudo iniciar la grabación: ' + (error as Error).message, icon: 'alert-circle', iconColor: '#ef4444' });
        }
    };

    const stopRecording = async () => {
        if (!isRecording) return;

        try {
            console.log('--- MIC STOP ---');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await recorder.stop();
            const uri = recorder.uri;
            const duration = recordingDuration;

            setIsRecording(false);
            isRecordingRef.current = false;
            setRecordingDuration(0);

            // Validar duración mínima de 1 segundo para evitar grabaciones accidentales
            if (duration < 1) {
                console.log('Recording too short, discarding');
                setAudioError('Mantén presionado al menos 1 segundo para grabar');
                setTimeout(() => setAudioError(null), 2500);
                return;
            }

            if (uri) {
                setRecordedAudio({ uri, duration });
                console.log('Recording stopped, URI:', uri);
            } else {
                console.warn('No valid audio data received');
                setAudioError('No se recibió audio válido. Intenta grabar de nuevo.');
                setTimeout(() => setAudioError(null), 3000);
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsRecording(false);
            isRecordingRef.current = false;
            setRecordingDuration(0);
            setAudioError('Error al detener la grabación');
        }
    };

    const playRecordedAudio = useCallback(async () => {
        if (!recordedAudio || !playerRef.current || isLoadingAudio) return;

        try {
            const player = playerRef.current;

            // Si está reproduciendo, pausar
            if (player.playing) {
                player.pause();
                setIsPlaying(false);
                return;
            }

            // Mostrar loader mientras carga
            setIsLoadingAudio(true);

            // Cambiar a modo reproducción antes de reproducir
            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            // Reiniciar si terminó
            if (player.currentTime >= player.duration && player.duration > 0) {
                player.seekTo(0);
            }

            player.play();

            // Esperar a que realmente comience la reproducción
            const checkPlayingInterval = setInterval(() => {
                if (playerRef.current?.playing) {
                    setIsLoadingAudio(false);
                    setIsPlaying(true);
                    clearInterval(checkPlayingInterval);

                    // Monitorear progreso de reproducción
                    const progressInterval = setInterval(() => {
                        if (playerRef.current) {
                            const current = playerRef.current.currentTime;
                            const total = playerRef.current.duration;
                            if (total > 0) {
                                setPlaybackProgress((current / total) * 100);
                            }
                            if (!playerRef.current.playing) {
                                setIsPlaying(false);
                                clearInterval(progressInterval);
                            }
                        } else {
                            clearInterval(progressInterval);
                        }
                    }, 100);
                }
            }, 50);

            // Timeout de seguridad para evitar loading infinito
            setTimeout(() => {
                clearInterval(checkPlayingInterval);
                if (isLoadingAudio) {
                    setIsLoadingAudio(false);
                }
            }, 3000);

        } catch (error) {
            console.error('Error playing audio', error);
            setAudioError('Error al reproducir el audio');
            setIsPlaying(false);
            setIsLoadingAudio(false);
        }
    }, [recordedAudio, isLoadingAudio]);

    const discardRecording = () => {
        // Detener reproducción si está sonando
        if (playerRef.current) {
            try {
                if (playerRef.current.playing) {
                    playerRef.current.pause();
                }
                playerRef.current.remove();
            } catch (e) {
                console.log('Error stopping player:', e);
            }
            playerRef.current = null;
        }
        setRecordedAudio(null);
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setPlaybackProgress(0);
    };

    const sendRecording = () => {
        if (!recordedAudio) return;

        const userMessage = addMessage({
            type: 'audio',
            content: recordedAudio.uri,
            sender: 'user',
            audioDuration: recordedAudio.duration,
        });

        simulateAssistantResponse(userMessage);
        setRecordedAudio(null);
    };

    const handlePickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        showAlert({
            title: 'Enviar Imagen',
            message: 'Selecciona una opción',
            icon: 'image',
            buttons: [
                {
                    text: 'Cámara',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            showAlert({ title: 'Permisos necesarios', message: 'Necesitamos acceso a tu cámara', icon: 'camera-off', iconColor: '#f59e0b' });
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
                            showAlert({ title: 'Permisos necesarios', message: 'Necesitamos acceso a tu galería', icon: 'image-off', iconColor: '#f59e0b' });
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
            ]
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                        <Text className={`text-base leading-5 ${isUser ? 'text-white' : 'text-gray-700 dark:text-white'}`}>
                            {item.content}
                        </Text>
                    )}

                    {item.type === 'audio' && (
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name="file-music"
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
        <>
            <CustomHeader title="Asistente IA" />
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}
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
                                <Text className="text-sm text-gray-500 dark:text-gray-400">Procesando...</Text>
                            </View>
                        </View>
                    )}

                    {/* Error Indicator */}
                    {audioError && (
                        <View className="mx-4 mb-2 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg items-center">
                            <Text className="text-xs font-medium text-red-500">{audioError}</Text>
                        </View>
                    )}

                    {/* Input Area */}
                    <View className="px-4 py-4 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border">
                        {recordedAudio ? (
                            // Audio Preview UI
                            <View className="flex-row items-center justify-between py-1">
                                <TouchableOpacity
                                    onPress={discardRecording}
                                    className="w-11 h-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                                >
                                    <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                                </TouchableOpacity>

                                <View className="flex-1 flex-row items-center justify-center mx-4 bg-light-surface dark:bg-dark-surface rounded-full py-2 px-4 border border-light-border dark:border-dark-border">
                                    <Pressable onPress={playRecordedAudio} className="mr-3" disabled={isLoadingAudio}>
                                        {isLoadingAudio ? (
                                            <ActivityIndicator size={28} color={currentPrimaryColor} />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name={isPlaying ? "pause-circle" : "play-circle"}
                                                size={32}
                                                color={currentPrimaryColor}
                                            />
                                        )}
                                    </Pressable>
                                    <View className="flex-row items-center">
                                        <View className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-2 overflow-hidden">
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${playbackProgress}%`,
                                                    backgroundColor: currentPrimaryColor
                                                }}
                                            />
                                        </View>
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                                            {formatDuration(recordedAudio.duration)}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={sendRecording}
                                    className="w-11 h-11 items-center justify-center rounded-full"
                                    style={{ backgroundColor: currentPrimaryColor }}
                                >
                                    <MaterialCommunityIcons name="send" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : inputMode === 'voice' ? (
                            // Voice Mode UI - Centered Record Button
                            <View className="items-center py-2">
                                {/* Top row: Image button (left) and Text mode button (right) */}
                                <View className="flex-row justify-between w-full px-4 mb-4">
                                    <TouchableOpacity
                                        onPress={handlePickImage}
                                        className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                        disabled={isRecording || isPreparing}
                                    >
                                        <MaterialCommunityIcons
                                            name="image"
                                            size={24}
                                            color={isRecording || isPreparing ? '#9ca3af' : '#6b7280'}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setInputMode('text')}
                                        className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                        disabled={isRecording || isPreparing}
                                    >
                                        <MaterialCommunityIcons
                                            name="keyboard"
                                            size={24}
                                            color={isRecording || isPreparing ? '#9ca3af' : '#6b7280'}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Center: Large Record Button */}
                                <TouchableOpacity
                                    onPress={isRecording ? stopRecording : startRecording}
                                    disabled={isPreparing}
                                    className="w-20 h-20 rounded-full items-center justify-center mb-3"
                                    style={{
                                        backgroundColor: isPreparing
                                            ? '#9ca3af'
                                            : isRecording
                                                ? '#ef4444'
                                                : currentPrimaryColor,
                                        transform: [{ scale: isRecording ? 1.1 : 1 }],
                                        shadowColor: isRecording ? '#ef4444' : currentPrimaryColor,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {isPreparing ? (
                                        <ActivityIndicator size={36} color="#fff" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={isRecording ? 'stop' : 'microphone'}
                                            size={36}
                                            color="#fff"
                                        />
                                    )}
                                </TouchableOpacity>

                                {/* Status Text */}
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    {isPreparing
                                        ? 'Preparando...'
                                        : isRecording
                                            ? `Grabando ${formatDuration(recordingDuration)}`
                                            : 'Toca para grabar'}
                                </Text>
                            </View>
                        ) : (
                            // Text Mode UI
                            <View className="flex-row items-end gap-2">
                                {/* Back to Voice Mode Button */}
                                <TouchableOpacity
                                    onPress={() => setInputMode('voice')}
                                    className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                >
                                    <MaterialCommunityIcons
                                        name="microphone"
                                        size={24}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>

                                {/* Text Input */}
                                <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-3xl px-4 py-2 min-h-[44px] max-h-[120px] justify-center">
                                    <TextInput
                                        className="text-base text-gray-700 dark:text-white"
                                        placeholder="Escribe un mensaje..."
                                        placeholderTextColor="#9ca3af"
                                        value={inputText}
                                        onChangeText={setInputText}
                                        multiline
                                        autoFocus
                                    />
                                </View>

                                {/* Send Button or Image Button */}
                                {inputText.trim() ? (
                                    <TouchableOpacity
                                        onPress={handleSendText}
                                        className="w-11 h-11 rounded-full items-center justify-center"
                                        style={{ backgroundColor: currentPrimaryColor }}
                                    >
                                        <MaterialCommunityIcons name="send" size={22} color="#fff" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handlePickImage}
                                        className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                    >
                                        <MaterialCommunityIcons
                                            name="image"
                                            size={24}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
