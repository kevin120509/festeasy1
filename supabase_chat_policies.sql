-- HABILITAR ROW LEVEL SECURITY (RLS)
-- Copia y ejecuta este código en el Editor SQL de tu proyecto en Supabase dashboard.

-- 1. Habilitar RLS en las tablas (si no está habilitado)
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para CANALES (chat_channels)

-- Permitir a los usuarios VER sus propios canales (si son cliente o proveedor)
CREATE POLICY "Ver mis canales" ON chat_channels
FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Permitir a los usuarios CREAR canales donde ellos participen
CREATE POLICY "Crear canales" ON chat_channels
FOR INSERT
WITH CHECK (auth.uid() = client_id OR auth.uid() = provider_id);

-- 3. Políticas para MENSAJES (chat_messages)

-- Permitir VER mensajes si el usuario pertenece al canal correspondiente
CREATE POLICY "Ver mensajes del canal" ON chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_channels
    WHERE id = chat_messages.channel_id
    AND (client_id = auth.uid() OR provider_id = auth.uid())
  )
);

-- Permitir ENVIAR mensajes si el usuario pertenece al canal
CREATE POLICY "Enviar mensajes al canal" ON chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_channels
    WHERE id = chat_messages.channel_id
    AND (client_id = auth.uid() OR provider_id = auth.uid())
  )
);
