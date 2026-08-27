import { Html, Button, Text, Container, Section } from '@react-email/components';
import * as React from 'react';

interface Props {
  nombre: string;
  urlRecuperacion: string;
}

export const RecuperacionPassword = ({ nombre, urlRecuperacion }: Props) => {
  return (
    <Html>
      <Container style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <Section>
          <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Hola, {nombre}</Text>
          <Text>
            Recibimos una solicitud para restablecer tu contraseña.
          </Text>
          <Button 
            href={urlRecuperacion} 
            style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none' }}
          >
            Restablecer mi contraseña
          </Button>
          <Text style={{ fontSize: '12px', color: '#666', marginTop: '30px' }}>
            Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
          </Text>
        </Section>
      </Container>
    </Html>
  );
};