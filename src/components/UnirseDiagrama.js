// UnirseDiagrama.js
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
const UnirseDiagrama = () => {
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const history = useHistory();

  const aceptarInvitacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/invitations/accept',
        { codigoInvitacion },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { diagramaId } = response.data;
      history.push(`/diagramas/${diagramaId}/editor`);
    } catch (error) {
      console.error('Error al aceptar la invitación:', error);
      alert('Código de invitación inválido o expirado');
    }
  };

  return (
    <div>
      <h2>Unirse a un Diagrama</h2>
      <input
        type="text"
        placeholder="Ingrese el código de invitación"
        value={codigoInvitacion}
        onChange={(e) => setCodigoInvitacion(e.target.value)}
      />
      <button onClick={aceptarInvitacion}>Unirse</button>
    </div>
  );
};

export default UnirseDiagrama;
