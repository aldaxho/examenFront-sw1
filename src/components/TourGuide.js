import React, { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';
import styled from 'styled-components';

const TourButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TourGuide = ({ isVisible = true }) => {
  const driverObj = useRef(null);

  useEffect(() => {
    // Inicializar Driver.js
    driverObj.current = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: '¡Completar!',
      closeBtnText: 'Cerrar',
      popoverClass: 'driver-popover-custom',
      overlayClass: 'driver-overlay-custom',
      steps: [
        {
          element: '#agregar-clase',
          popover: {
            title: '🎯 ¡Comienza aquí!',
            description: 'Haz clic en "Agregar Clase" para crear tu primera clase UML. Esta es la base de cualquier diagrama.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#crear-asociacion',
          popover: {
            title: '🔗 Conecta tus clases',
            description: 'Una vez que tengas clases, usa este botón para crear asociaciones entre ellas. Las asociaciones muestran cómo se relacionan las clases.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#crear-composicion',
          popover: {
            title: '🏗️ Composición',
            description: 'La composición es una relación fuerte donde una clase "posee" otra. Si la clase padre se destruye, la hija también.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#crear-agregacion',
          popover: {
            title: '📦 Agregación',
            description: 'La agregación es una relación débil donde una clase "contiene" otra, pero pueden existir independientemente.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#crear-generalizacion',
          popover: {
            title: '🌳 Herencia',
            description: 'La generalización muestra herencia entre clases. Una clase hija hereda propiedades y métodos de su clase padre.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#mostrar-ia',
          popover: {
            title: '🤖 Asistente Inteligente',
            description: '¡Tu asistente de IA está aquí para ayudarte! Puede sugerir mejoras, generar código, y optimizar tu diagrama automáticamente.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#exportar-backend',
          popover: {
            title: '💾 Guardar en Backend',
            description: 'Guarda tu diagrama en el servidor para acceder a él desde cualquier lugar y colaborar con otros usuarios.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#exportar-xmi',
          popover: {
            title: '📤 Exportar XMI',
            description: 'Exporta tu diagrama en formato XMI estándar para usar en otras herramientas UML como Enterprise Architect o Visual Paradigm.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#generar-codigo-invitacion',
          popover: {
            title: '👥 Colaboración',
            description: 'Genera un código de invitación para que otros usuarios puedan colaborar en tu diagrama en tiempo real.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#centrar-vista',
          popover: {
            title: '🎯 Centrar Vista',
            description: 'Si pierdes la vista de tu diagrama, usa este botón para centrar automáticamente la vista en el área de trabajo.',
            side: 'left',
            align: 'start'
          }
        }
      ]
    });

    // Agregar estilos personalizados
    const style = document.createElement('style');
    style.textContent = `
      .driver-popover-custom {
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
        border: 2px solid #667eea !important;
      }
      
      .driver-popover-custom .driver-popover-title {
        color: #667eea !important;
        font-weight: 600 !important;
        font-size: 18px !important;
      }
      
      .driver-popover-custom .driver-popover-description {
        color: #555 !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      
      .driver-popover-custom .driver-popover-footer {
        border-top: 1px solid #e0e0e0 !important;
        padding-top: 15px !important;
      }
      
      .driver-popover-custom .driver-popover-progress-text {
        color: #667eea !important;
        font-weight: 500 !important;
      }
      
      .driver-overlay-custom {
        background: rgba(102, 126, 234, 0.1) !important;
      }
      
      .driver-popover-custom .driver-popover-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border: none !important;
        border-radius: 8px !important;
        color: white !important;
        font-weight: 500 !important;
        padding: 8px 16px !important;
        transition: all 0.3s ease !important;
      }
      
      .driver-popover-custom .driver-popover-btn:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
      }
      
      .driver-popover-custom .driver-popover-btn.driver-popover-btn-secondary {
        background: #f8f9fa !important;
        color: #6c757d !important;
        border: 1px solid #dee2e6 !important;
      }
      
      .driver-popover-custom .driver-popover-btn.driver-popover-btn-secondary:hover {
        background: #e9ecef !important;
        transform: translateY(-1px) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const startTour = () => {
    if (driverObj.current) {
      driverObj.current.drive();
    }
  };

  if (!isVisible) return null;

  return (
    <TourButton onClick={startTour} title="Reproducir tour guiado">
      <HelpCircle size={16} />
      Tour
    </TourButton>
  );
};

export default TourGuide;
