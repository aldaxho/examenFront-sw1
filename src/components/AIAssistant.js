import React, { useCallback, useEffect, useRef, useState } from 'react';
import { use } from 'react';
import styled, { css } from 'styled-components';
import API_CONFIG from '../services/apiConfig';
// VS Code style panel + draggable + resizable
const PanelWrapper = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	width: ${(p) => p.$width || 380}px;
	background: #1e1e1e;
	color: #ddd;
	display: flex;
	flex-direction: column;
	border-left: 1px solid #333;
	box-shadow: -2px 0 6px rgba(0,0,0,0.4);
	z-index: 1600; /* > usuarios panel */
	font-family: 'Segoe UI', system-ui, sans-serif;
	${(p) => p.$hidden && css`display:none;`}
`;

const Header = styled.div`
	height: 38px;
	display: flex;
	align-items: center;
	padding: 0 10px;
	background: linear-gradient(#2a2d2e, #252729);
	border-bottom: 1px solid #2f3234;
	cursor: move;
	gap: 8px;
`;

const Title = styled.div`
	font-size: 13px;
	font-weight: 500;
	flex: 1;
	color: #ddd;
	user-select: none;
`;

const IconButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	color: #fff;
	cursor: pointer;
	width: 32px;
	height: 32px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: bold;
	&:hover { 
		background: rgba(255, 255, 255, 0.2); 
		color: #fff; 
		transform: scale(1.1);
		border-color: rgba(255, 255, 255, 0.4);
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const Messages = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 12px 14px 70px;
	font-size: 13px;
	line-height: 1.45;
	scrollbar-width: thin;
	&::-webkit-scrollbar { width: 8px; }
	&::-webkit-scrollbar-track { background: #1e1e1e; }
	&::-webkit-scrollbar-thumb { background: #3a3d41; border-radius: 4px; }
`;

const Bubble = styled.div`
	margin-bottom: 14px;
	display: flex;
	align-items: flex-start;
	gap: 10px;
`;

const BubbleAvatar = styled.div`
	width: 28px;
	height: 28px;
	border-radius: 4px;
	background: ${(p) => p.$user ? '#005fb8' : '#444'};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
	color: #fff;
	user-select: none;
`;

const BubbleContent = styled.div`
	flex: 1;
	background: ${(p) => p.$user ? '#003b5c' : '#2d2f31'};
	border: 1px solid ${(p) => p.$user ? '#004b74' : '#37393b'};
	padding: 8px 10px;
	border-radius: 6px;
	white-space: pre-wrap;
	word-break: break-word;
`;

const InputBar = styled.form`
	position: absolute;
	left: 0;
	bottom: 0;
	width: 100%;
	background: #252526;
	border-top: 1px solid #333;
	padding: 8px 10px 10px;
	display: flex;
	gap: 8px;
`;

const TextArea = styled.textarea`
	flex: 1;
	resize: none;
	background: #1e1e1e;
	border: 1px solid #3a3d41;
	color: #ddd;
	font-size: 13px;
	line-height: 1.35;
	padding: 6px 8px;
	border-radius: 4px;
	max-height: 120px;
	min-height: 40px;
	&:focus { outline: 1px solid #007acc; }
`;

const SendButton = styled.button`
	background: #0e639c;
	border: 1px solid #0e639c;
	color: #fff;
	font-size: 12px;
	font-weight: 600;
	padding: 0 16px;
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	align-items: center;
	&:hover { background:#1177bb; }
	&:disabled { opacity: 0.5; cursor: default; }
`;

const ResizeHandle = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 4px;
	height: 100%;
	cursor: ew-resize;
	background: transparent;
	&:hover { background: rgba(255,255,255,0.06); }
`;

// Floating toggle button (bottom-right) if panel hidden
const FloatingToggle = styled.button`
	position: fixed;
	bottom: 18px;
	right: 18px;
	z-index: 1550; /* just below panel */
	background: #0e639c;
	color:#fff;
	border: none;
	padding: 10px 14px;
	border-radius: 50px;
	font-size: 13px;
	font-weight: 600;
	box-shadow: 0 4px 16px rgba(0,0,0,0.35);
	display: flex;
	gap: 8px;
	align-items: center;
	cursor: pointer;
	&:hover { background:#1177bb; }
`;

// Función para aplicar los cambios del patch al diagrama
function applyPatchToDiagram(patch) {
  try {
    console.log('Aplicando patch al diagrama:', patch);
    
    // Verificar que patch sea válido
    if (!patch) {
      console.error('❌ Patch es null o undefined');
      return;
    }
    
    // Si patch es un string, intentar parsearlo
    let parsedPatch = patch;
    if (typeof patch === 'string') {
      try {
        parsedPatch = JSON.parse(patch);
        console.log('✅ Patch parseado desde string:', parsedPatch);
      } catch (parseError) {
        console.error('❌ Error parseando patch JSON:', parseError);
        console.log('Patch original:', patch);
        return;
      }
    }
    
    // Verificar que sea un array
    if (!Array.isArray(parsedPatch)) {
      console.error('❌ Patch no es un array válido:', parsedPatch);
      return;
    }
    
    // Emitir evento personalizado para que el EditorDiagrama pueda procesar los cambios
    const patchEvent = new CustomEvent('ai-patch-apply', {
      detail: { patch: parsedPatch }
    });
    window.dispatchEvent(patchEvent);
    
    console.log('✅ Patch aplicado exitosamente');
  } catch (error) {
    console.error('❌ Error aplicando patch:', error);
    console.log('Patch que causó el error:', patch);
  }
}

async function* streamAIResponse(prompt, diagramId, currentDiagram) {
  try {
    const token = localStorage.getItem('token');
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
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    // Debug: Mostrar la respuesta completa del backend
    console.log('🔍 Respuesta completa del backend:', result);
    
    // Si hay cambios en el diagrama, aplicar los cambios directamente
    if (result.proposal && result.proposal.patch) {
      console.log('📦 Patch encontrado:', result.proposal.patch);
      // Aplicar los cambios del patch al diagrama
      applyPatchToDiagram(result.proposal.patch);
      yield "✅ Diagrama actualizado automáticamente\n\n";
    } else {
      console.log('⚠️ No se encontró patch en la respuesta');
    }

    // Procesar la respuesta del agente
    if (result.analysis && result.analysis.summary) {
      // Si el summary es un JSON string, parsearlo
      let summaryText = result.analysis.summary;
      try {
        const parsedSummary = JSON.parse(summaryText);
        if (parsedSummary.analysis && parsedSummary.analysis.summary) {
          summaryText = parsedSummary.analysis.summary;
        }
      } catch (e) {
        // No es JSON, usar el texto tal como está
      }
      
      const words = summaryText.split(' ');
      for (const word of words) {
        await new Promise(r => setTimeout(r, 50));
        yield word + ' ';
      }
    } else if (result.messages && result.messages.length > 0) {
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
	// Sync when controlled prop changes
	useEffect(() => { if (controlled) setOpen(isOpen); }, [isOpen, controlled]);
	const [panelWidth, setPanelWidth] = useState(width);
	const [dragging, setDragging] = useState(false);
	const [resizing, setResizing] = useState(false);
	const dragStart = useRef({ x: 0, w: width });
	const panelRef = useRef(null);

	const [messages, setMessages] = useState([
		{ id: 'sys-hello',
		  role: 'assistant',
		  content: 'Hola, soy tu asistente IA. ¿En qué te ayudo con el diagrama?' }
	]);
	const [input, setInput] = useState('');
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef(null);

	// Auto scroll
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, open]);

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

	const handleMouseMove = useCallback((e) => {
		if (resizing) {
			const newWidth = Math.min(700, Math.max(300, window.innerWidth - e.clientX));
			setPanelWidth(newWidth);
		}
	}, [resizing]);

	useEffect(() => {
		function up() {
			setResizing(false);
			setDragging(false);
		}
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', up);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', up);
		};
	}, [handleMouseMove]);

	const sendMessage = async (e) => {
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
		let accumulated = '';

		setMessages(m => [...m, { 
			id: aiId, 
			role: 'assistant', 
			content: 'Procesando...' }]);
		try {
			for await (const chunk of streamAIResponse(userMsg.content, diagramId, currentDiagram)) {

				accumulated += chunk;
				setMessages(m => m.map(msg => 
					msg.id === aiId ? { ...msg, content: accumulated } : msg));
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
	};


	 // Listener para actualizaciones del diagrama desde Socket.IO
	useEffect(() => {
		// Si hay un callback para escuchar actualizaciones del agente
		const handleAgentUpdate = (data) => {
		if (data.type === 'diagram_modified') {
			setMessages(prev => [...prev, {
			id: Date.now() + '-agent-update',
			role: 'assistant',
			content: `✅ ${data.message || 'Diagrama actualizado automáticamente'}`
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
					<i className="fas fa-robot"></i> IA
				</FloatingToggle>
			)}
			<PanelWrapper ref={panelRef} $width={panelWidth} $hidden={!open} style={{ zIndex: zIndexBase }}>
				<ResizeHandle onMouseDown={() => setResizing(true)} />
				<Header>
					<Title>Asistente IA</Title>
					<IconButton title={sending ? 'Generando...' : 'Nueva conversación'} disabled={sending}
						onClick={() => !sending && setMessages([{ id: 'sys-hello', role: 'assistant', content: 'Conversación reiniciada. ¿Qué necesitas ahora?' }])}>
						↻
					</IconButton>
					<IconButton title="Cerrar" onClick={toggle}>
						×
					</IconButton>
				</Header>
				<Messages>
					{messages.map(msg => (
						<Bubble key={msg.id}>
							<BubbleAvatar $user={msg.role === 'user'}>{msg.role === 'user' ? 'Tú' : 'IA'}</BubbleAvatar>
							<BubbleContent $user={msg.role === 'user'}>{msg.content}</BubbleContent>
						</Bubble>
					))}
					<div ref={messagesEndRef} />
				</Messages>
				<InputBar onSubmit={sendMessage}>
					<TextArea
						rows={1}
						value={input}
						placeholder={sending ? 'Esperando respuesta...' : 'Escribe tu mensaje...'}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
					/>
					<SendButton type="submit" disabled={sending || !input.trim()}>
						{sending ? '...' : 'Enviar'}
					</SendButton>
				</InputBar>
			</PanelWrapper>
		</>
	);
};

export default AIAssistant;
