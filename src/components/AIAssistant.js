import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import API_CONFIG from '../services/apiConfig';
// Modern chat panel with clean design
const PanelWrapper = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	width: ${(p) => p.$width || 420}px;
	background: #ffffff;
	color: #374151;
	display: flex;
	flex-direction: column;
	border-left: 1px solid #e5e7eb;
	box-shadow: -4px 0 20px rgba(0,0,0,0.08);
	z-index: 1600;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
	${(p) => p.$hidden && css`display:none;`}
	transition: all 0.3s ease;
`;

const Header = styled.div`
	height: 60px;
	display: flex;
	align-items: center;
	padding: 0 20px;
	background: #ffffff;
	border-bottom: 1px solid #e5e7eb;
	cursor: move;
	gap: 12px;
	position: relative;
`;

const Title = styled.div`
	font-size: 18px;
	font-weight: 600;
	flex: 1;
	color: #111827;
	user-select: none;
`;

const IconButton = styled.button`
	background: #f3f4f6;
	border: 1px solid #d1d5db;
	color: #6b7280;
	cursor: pointer;
	width: 36px;
	height: 36px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: 500;
	transition: all 0.2s ease;
	
	&:hover { 
		background: #e5e7eb; 
		color: #374151; 
		transform: scale(1.05);
		border-color: #9ca3af;
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const Messages = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 20px 20px 100px;
	font-size: 15px;
	line-height: 1.6;
	scrollbar-width: thin;
	scrollbar-color: #d1d5db transparent;
	
	&::-webkit-scrollbar { 
		width: 6px; 
	}
	&::-webkit-scrollbar-track { 
		background: transparent; 
	}
	&::-webkit-scrollbar-thumb { 
		background: #d1d5db; 
		border-radius: 3px; 
	}
	&::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
`;

const Bubble = styled.div`
	margin-bottom: 24px;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	animation: fadeInUp 0.3s ease-out;
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

const BubbleAvatar = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${(p) => p.$user ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
	color: #fff;
	user-select: none;
	flex-shrink: 0;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const BubbleContent = styled.div`
	flex: 1;
	background: ${(p) => p.$user ? '#f3f4f6' : '#ffffff'};
	border: 1px solid ${(p) => p.$user ? '#e5e7eb' : '#e5e7eb'};
	padding: 12px 16px;
	border-radius: 18px;
	white-space: pre-wrap;
	word-break: break-word;
	color: ${(p) => p.$user ? '#374151' : '#111827'};
	font-weight: 400;
	line-height: 1.5;
	box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	position: relative;
	
	${(p) => p.$user ? `
		border-bottom-right-radius: 6px;
	` : `
		border-bottom-left-radius: 6px;
	`}
`;

const InputBar = styled.form`
	position: absolute;
	left: 0;
	bottom: 0;
	width: 100%;
	background: #ffffff;
	border-top: 1px solid #e5e7eb;
	padding: 16px 20px;
	display: flex;
	gap: 12px;
	align-items: flex-end;
	box-sizing: border-box;
`;

const TextArea = styled.textarea`
	flex: 1;
	resize: none;
	background: #f9fafb;
	border: 2px solid #e5e7eb;
	color: #111827;
	font-size: 15px;
	line-height: 1.5;
	padding: 12px 16px;
	border-radius: 12px;
	max-height: 120px;
	min-height: 48px;
	font-family: inherit;
	transition: all 0.2s ease;
	
	&:focus { 
		outline: none; 
		border-color: #667eea;
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	&::placeholder {
		color: #9ca3af;
	}
`;

const VoiceButton = styled.button`
	background: ${(p) => p.$listening ? '#ef4444' : '#f3f4f6'};
	border: 1px solid ${(p) => p.$listening ? '#dc2626' : '#d1d5db'};
	color: ${(p) => p.$listening ? '#fff' : '#6b7280'};
	cursor: pointer;
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	font-weight: 500;
	transition: all 0.2s ease;
	flex-shrink: 0;
	
	&:hover { 
		background: ${(p) => p.$listening ? '#dc2626' : '#e5e7eb'}; 
		color: ${(p) => p.$listening ? '#fff' : '#374151'}; 
		transform: scale(1.05);
		border-color: ${(p) => p.$listening ? '#b91c1c' : '#9ca3af'};
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const SendButton = styled.button`
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	color: #fff;
	font-size: 14px;
	font-weight: 600;
	padding: 12px 20px;
	border-radius: 12px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 6px;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	min-height: 48px;
	min-width: 70px;
	justify-content: center;
	flex-shrink: 0;
	
	&:hover { 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
	}
`;

const ResizeHandle = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 4px;
	height: 100%;
	cursor: ew-resize;
	background: transparent;
	&:hover { background: rgba(102, 126, 234, 0.2); }
`;

// Floating toggle button (bottom-right) if panel hidden
const FloatingToggle = styled.button`
	position: fixed;
	bottom: 24px;
	right: 24px;
	z-index: 1550;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	padding: 14px 18px;
	border-radius: 50px;
	font-size: 14px;
	font-weight: 600;
	box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
	display: flex;
	gap: 8px;
	align-items: center;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:hover { 
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
	}
`;

// Función para enviar los cambios del diagrama al editor principal
function applyPatchToDiagram(patch) {
  try {
    // Verificar que el patch no esté vacío
    if (!patch) {
      console.error('No hay cambios para aplicar');
      return;
    }

    // Si el patch viene como texto, convertirlo a objeto
    let parsedPatch = patch;
    if (typeof patch === 'string') {
      try {
        parsedPatch = JSON.parse(patch);
      } catch (error) {
        console.error('Error al convertir los cambios:', error);
        return;
      }
    }

    // Verificar si es un objeto válido
    if (typeof parsedPatch === 'object' && parsedPatch !== null) {
      // Si tiene clases o relaciones, es un diagrama completo
      if ((parsedPatch.classes !== undefined || parsedPatch.relations !== undefined) && !Array.isArray(parsedPatch)) {
        // Enviar evento para actualizar el diagrama
        const patchEvent = new CustomEvent('ai-patch-apply', {
          detail: { patch: parsedPatch }
        });
        window.dispatchEvent(patchEvent);
        return;
      }

      // Si es un array de operaciones
      if (Array.isArray(parsedPatch)) {
        const patchEvent = new CustomEvent('ai-patch-apply', {
          detail: { patch: parsedPatch }
        });
        window.dispatchEvent(patchEvent);
        return;
      }

      // Buscar si hay datos en otras propiedades
      const possibleProps = ['operations', 'patches', 'changes', 'data', 'result', 'actions'];
      for (const prop of possibleProps) {
        if (parsedPatch[prop] && Array.isArray(parsedPatch[prop])) {
          const patchEvent = new CustomEvent('ai-patch-apply', {
            detail: { patch: parsedPatch[prop] }
          });
          window.dispatchEvent(patchEvent);
          return;
        }
      }

      // Si es una operación única (clase o relación)
      if (parsedPatch.type || parsedPatch.name || (parsedPatch.source && parsedPatch.target)) {
        const patchEvent = new CustomEvent('ai-patch-apply', {
          detail: { patch: [parsedPatch] }
        });
        window.dispatchEvent(patchEvent);
        return;
      }
    }

  } catch (error) {
    console.error('Error aplicando cambios:', error);
  }
}

// Función que envía el mensaje al agente IA y recibe la respuesta
async function* streamAIResponse(prompt, diagramId, currentDiagram) {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    
    // Enviar el mensaje al servidor
    const response = await fetch(API_CONFIG.getUrl(`/api/assistant/chat/${diagramId}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_message: prompt,
        intent: detectIntent(prompt),
        diagram: currentDiagram
      })
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

		// Obtener la respuesta del agente
		const result = await response.json();

		// Función para extraer JSON de un texto (por si viene mezclado con otro texto)
		const extractJsonFromString = (text) => {
			if (!text || typeof text !== 'string') return null;
			
			// Quitar los bloques de código ```json ``` si existen
			const cleanText = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '');
			
			// Buscar dónde empieza y termina el JSON
			const firstBrace = cleanText.indexOf('{');
			const firstBracket = cleanText.indexOf('[');
			let start = -1;
			let end = -1;
			
			if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
				start = firstBrace;
				end = cleanText.lastIndexOf('}');
			} else if (firstBracket !== -1) {
				start = firstBracket;
				end = cleanText.lastIndexOf(']');
			}
			
			if (start === -1 || end === -1 || end <= start) return null;
			
			// Intentar convertir a objeto
			const jsonText = cleanText.substring(start, end + 1).trim();
			try {
				return JSON.parse(jsonText);
			} catch (e) {
				return null;
			}
		};

		// El diagrama se actualiza automáticamente
		// Esta función está deshabilitada
		const tryApplyPatchFromResult = (res) => {
			try {
				// El servidor actualiza el diagrama por Socket.IO
				// No se necesita procesamiento local
				return false;

				// Código deshabilitado:
				if (res.analysis && typeof res.analysis.summary === 'string') {
					const parsed = extractJsonFromString(res.analysis.summary);
					if (parsed) {
						console.log('✓ JSON encontrado en analysis.summary');
						applyPatchToDiagram(parsed);
						return true;
					}
				}

				// 3) messages puede contener JSON en texto
				if (res.messages && Array.isArray(res.messages)) {
					for (const m of res.messages) {
						const text = typeof m === 'string' ? m : (m?.content || '');
						const parsed = extractJsonFromString(text);
						if (parsed) {
							console.log('✓ JSON encontrado en messages');
							applyPatchToDiagram(parsed);
							return true;
						}
					}
				}

				// 4) campos comunes: text, content, result
				for (const key of ['text','content','result','data']) {
					if (res[key] && typeof res[key] === 'string') {
						const parsed = extractJsonFromString(res[key]);
						if (parsed) {
							console.log('✓ JSON encontrado en campo:', key);
							applyPatchToDiagram(parsed);
							return true;
						}
					}
				}

				return false;
			} catch (err) {
				console.error('Error procesando respuesta:', err);
				return false;
			}
		};

		// Intentar aplicar cambios (normalmente retorna false porque Socket.IO se encarga)
		tryApplyPatchFromResult(result);
		
		// Mostrar mensaje de confirmación
		yield "✅ Procesado. El diagrama se actualizará automáticamente.\n\n";

    // Mostrar el mensaje del agente palabra por palabra
    if (result.analysis && result.analysis.summary) {
      let summaryText = result.analysis.summary;
      
      // Si el resumen es JSON, extraer el texto
      try {
        const parsedSummary = JSON.parse(summaryText);
        if (parsedSummary.analysis && parsedSummary.analysis.summary) {
          summaryText = parsedSummary.analysis.summary;
        }
      } catch (e) {
        // No es JSON, usar el texto tal cual
      }
      
      // Mostrar palabra por palabra con efecto de escritura
      const words = summaryText.split(' ');
      for (const word of words) {
        await new Promise(r => setTimeout(r, 50));
        yield word + ' ';
      }
    } else if (result.messages && result.messages.length > 0) {
      // Si hay mensajes, mostrarlos
      const words = result.messages[0].split(' ');
      for (const word of words) {
        await new Promise(r => setTimeout(r, 50));
        yield word + ' ';
      }
    } else {
      yield "Procesado exitosamente.";
    }

  } catch (error) {
    console.error('Error comunicándose con el agente:', error);
    yield `Error: ${error.message}`;
  }
}

// Detectar qué tipo de acción quiere hacer el usuario
function detectIntent(prompt) {
	const lowerPrompt = prompt.toLowerCase();
	
	if (lowerPrompt.includes('generar') || lowerPrompt.includes('crear') || 
		lowerPrompt.includes('diseña') || lowerPrompt.includes('haz')) {
		return 'generate';
	}
	if (lowerPrompt.includes('analizar') || lowerPrompt.includes('revisar') || 
		lowerPrompt.includes('evaluar')) {
		return 'analyze';
	}
	if (lowerPrompt.includes('modificar') || lowerPrompt.includes('cambiar') || 
		lowerPrompt.includes('actualizar')) {
		return 'modify';
	}
	return 'chat';
}


const AIAssistant = ({
	initialOpen = false,
	width = 380,
	onVisibilityChange,
	zIndexBase = 1600,
	hideFloatingButton = false,
	// Controlled mode props (backward compatibility)
	diagramId,
	currentDiagram = {classes: [], relations: []},
	onDiagramUpdate, //para cuando el diagrama se actualice
	isOpen,
	onToggle
}) => {
	const controlled = typeof isOpen === 'boolean';
	const [open, setOpen] = useState(controlled ? isOpen : initialOpen);
	// Sync when controlled prop changes (only when controlled mode is active)
	useEffect(() => {
		if (controlled && isOpen !== open) {
			setOpen(isOpen);
		}
	}, [isOpen, controlled, open]);
	const [panelWidth, setPanelWidth] = useState(width);
	const [resizing, setResizing] = useState(false);
	const panelRef = useRef(null);

	const [messages, setMessages] = useState([
		{ id: 'sys-hello',
		  role: 'assistant',
		  content: '¡Hola! Soy tu asistente de IA para diagramas UML. Puedo ayudarte a crear, analizar y mejorar tus diagramas. ¿En qué te puedo ayudar hoy?' }
	]);
	const [input, setInput] = useState('');
	const [sending, setSending] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [isSendingVoice, setIsSendingVoice] = useState(false);
	const messagesEndRef = useRef(null);
	const recognitionRef = useRef(null);
	const sendVoiceMessageRef = useRef(null);

	// Auto scroll
    useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, open]);

	// Inicializar reconocimiento de voz
	useEffect(() => {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			recognitionRef.current = new SpeechRecognition();
			
			recognitionRef.current.continuous = false;
			recognitionRef.current.interimResults = false;
			recognitionRef.current.lang = 'es-ES';
			
			recognitionRef.current.onstart = () => {
				setIsListening(true);
			};
			
				recognitionRef.current.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setInput(transcript);
				setIsListening(false);
				setIsSendingVoice(true);
				
				// Enviar automáticamente después de un breve delay
                setTimeout(() => {
					if (transcript.trim() && sendVoiceMessageRef.current) {
						sendVoiceMessageRef.current(transcript.trim());
					}
                }, 500);
			};
			
			recognitionRef.current.onerror = (event) => {
				console.error('Error de reconocimiento de voz:', event.error);
				setIsListening(false);
			};
			
			recognitionRef.current.onend = () => {
				setIsListening(false);
			};
		}
		
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

		const toggle = () => {
			if (controlled) {
				onToggle && onToggle(!isOpen);
				onVisibilityChange && onVisibilityChange(!isOpen);
			} else {
				setOpen(prev => {
					const next = !prev;
					onVisibilityChange && onVisibilityChange(next);
					return next;
				});
			}
		};

	// Resize handler with stable reference using ref to avoid infinite loops
	const resizingRef = useRef(false);
	useEffect(() => {
		resizingRef.current = resizing;
	}, [resizing]);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (resizingRef.current) {
				const newWidth = Math.min(700, Math.max(300, window.innerWidth - e.clientX));
				setPanelWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setResizing(false);
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	const startVoiceRecognition = () => {
		if (recognitionRef.current && !isListening) {
			try {
				recognitionRef.current.start();
			} catch (error) {
				console.error('Error iniciando reconocimiento de voz:', error);
				setIsListening(false);
			}
		}
	};

	const stopVoiceRecognition = () => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
	};

    // Update message content by ID (stable callback to avoid infinite loops)
    const updateAccumulatedMessage = useCallback((aiId, content) => {
        setMessages(prev => prev.map(msg =>
            msg.id === aiId ? { ...msg, content } : msg
        ));
    }, []);

	// Send message (voice or text) - use minimal dependencies
	const sendVoiceMessage = useCallback(async (transcript) => {
		if (!transcript || sending) return;

		if (!diagramId) {
			console.warn('no se proporciono diagramaId al AIAssistant');
			return;
		}

		const userMsg = {
			id: Date.now() + '-u',
			role: 'user',
			content: transcript };

		setMessages(m => [...m, userMsg]);
		setInput('');
		setSending(true);

		const aiId = Date.now() + '-a';

		setMessages(m => [...m, {
			id: aiId,
			role: 'assistant',
			content: 'Procesando...' }]);

        try {
            let accumulated = '';
            for await (const chunk of streamAIResponse(transcript, diagramId, currentDiagram)) {
                accumulated += chunk;
                updateAccumulatedMessage(aiId, accumulated);
            }
		} catch (err) {
			console.error('Error en streamAIResponse:', err);
			setMessages(m => m.map(msg =>
				msg.id === aiId ? {
					 ...msg,
					 content: 'Error al procesar la respuesta, Verifica la configuracion.'
					 } : msg));
		} finally {
			setSending(false);
			setIsSendingVoice(false);
		}
	}, [sending, diagramId, currentDiagram, updateAccumulatedMessage]);

	// Mantener referencia estable para el reconocimiento de voz
	useEffect(() => {
		sendVoiceMessageRef.current = sendVoiceMessage;
	}, [sendVoiceMessage]);

    const sendMessage = useCallback(async (e) => {
		e && e.preventDefault();
		if (!input.trim() || sending) return;

		if (!diagramId) {
			console.warn('no se proporciono diagramaId al AIAssistant');
			return;
		}

		const userMsg = {
			id: Date.now() + '-u',
			role: 'user',
			content: input.trim() };

		setMessages(m => [...m, userMsg]);
		setInput('');
		setSending(true);

		const aiId = Date.now() + '-a';

		setMessages(m => [...m, {
			id: aiId,
			role: 'assistant',
			content: 'Procesando...' }]);

        try {
            let accumulated = '';
            for await (const chunk of streamAIResponse(userMsg.content, diagramId, currentDiagram)) {
                accumulated += chunk;
                updateAccumulatedMessage(aiId, accumulated);
            }
		} catch (err) {
			console.error('Error en streamAIResponse:', err);
			setMessages(m => m.map(msg =>
				msg.id === aiId ? {
					 ...msg,
					 content: 'Error al procesar la respuesta, Verifica la configuracion.'
					 } : msg));
		} finally {
			setSending(false);
		}
	}, [input, sending, diagramId, currentDiagram, updateAccumulatedMessage]);


	 // Listener para actualizaciones del diagrama desde Socket.IO
	useEffect(() => {
		// Si hay un callback para escuchar actualizaciones del agente
		const handleAgentUpdate = (data) => {
		if (data.type === 'diagram_modified') {
			setMessages(prev => [...prev, {
			id: Date.now() + '-agent-update',
			role: 'assistant',
			content: `${data.message || 'Diagrama actualizado automáticamente'}`
			}]);
		}
		};

		// Si se pasa una función para escuchar eventos del socket
		if (onDiagramUpdate) {
		// El componente padre debería pasar esta función que escuche los eventos de socket
		window.addEventListener('agent-update', handleAgentUpdate);
		return () => window.removeEventListener('agent-update', handleAgentUpdate);
		}
	}, [onDiagramUpdate]);


	return (
		<>
			{!open && !hideFloatingButton && (
				<FloatingToggle onClick={toggle} style={{ zIndex: zIndexBase - 1 }}>
					Asistente IA
				</FloatingToggle>
			)}
			<PanelWrapper ref={panelRef} $width={panelWidth} $hidden={!open} style={{ zIndex: zIndexBase }}>
				<ResizeHandle onMouseDown={() => setResizing(true)} />
				<Header>
					<Title>Asistente IA</Title>
					<IconButton title={sending ? 'Generando...' : 'Nueva conversación'} disabled={sending}
						onClick={() => !sending && setMessages([{ id: 'sys-hello', role: 'assistant', content: '¡Conversación reiniciada! ¿Qué necesitas ahora?' }])}>
						↻
					</IconButton>
					<IconButton title="Cerrar" onClick={toggle}>
						×
					</IconButton>
				</Header>
				<Messages>
					{messages.map(msg => (
						<Bubble key={msg.id}>
							<BubbleAvatar $user={msg.role === 'user'}>{msg.role === 'user' ? 'U' : 'AI'}</BubbleAvatar>
							<BubbleContent $user={msg.role === 'user'}>{msg.content}</BubbleContent>
						</Bubble>
					))}
					<div ref={messagesEndRef} />
				</Messages>
				<InputBar onSubmit={sendMessage}>
					<TextArea
						rows={1}
						value={input}
						placeholder={
							isListening ? 'Escuchando...' : 
							isSendingVoice ? 'Enviando mensaje de voz...' :
							'Escribe tu mensaje...'
						}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
					/>
					<VoiceButton 
						$listening={isListening}
						onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
						title={isListening ? 'Detener grabación' : 'Grabar voz'}
						disabled={sending}
					>
						{isListening ? (
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="6" width="12" height="12" rx="2"/>
							</svg>
						) : (
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
								<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
							</svg>
						)}
					</VoiceButton>
					<SendButton type="submit" disabled={sending || !input.trim()}>
						{sending ? '...' : 'Enviar'}
					</SendButton>
				</InputBar>
			</PanelWrapper>
		</>
	);
};

export default AIAssistant;
