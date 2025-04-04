const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware para procesar el cuerpo de las solicitudes como JSON
app.use(express.json());

// URL y clave de autenticación para el agente GenAI
const genAIEndpoint = 'https://agent-7827685ec3fd5b88d2f1-rhth5.ondigitalocean.app/api/v1/chat/completions';
const genAIAuthorizationKey = 'Bearer tocUsCb4kMATRu-3JsA_4TbJYSVxFJR4';

// Función para consultar al agente GenAI
async function queryGenAI(userMessage) {
    try {
        const response = await axios.post(
            genAIEndpoint,
            {
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                stream: false,
                include_functions_info: false,
                include_retrieval_info: false,
                include_guardrails_info: false
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": genAIAuthorizationKey
                }
            }
        );

        return response.data.reply || 'Lo siento, no tengo una respuesta para tu solicitud.';
    } catch (error) {
        console.error('Error al consultar GenAI:', error.response?.data || error.message);
        throw new Error('Error al procesar la solicitud al agente GenAI.');
    }
}

// Endpoint para recibir solicitudes POST de Google Chat
app.post('/webhook/chatbot', async (req, res) => {
    try {
        // Extraer el mensaje del usuario
        const userMessage = req.body.message?.argumentText || req.body.message?.text;
        if (!userMessage) {
            return res.status(400).send({ text: 'No se proporcionó un mensaje válido.' });
        }

        console.log(`Mensaje recibido: ${userMessage}`);

        // Consultar al agente GenAI
        const agentReply = await queryGenAI(userMessage);
        console.log(`Respuesta del agente: ${agentReply}`);

        // Enviar la respuesta de vuelta a Google Chat
        res.json({
            text: agentReply
        });
    } catch (error) {
        console.error('Error al manejar la solicitud:', error.message);
        res.status(500).send({ text: 'Ocurrió un error al procesar tu solicitud.' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Aplicación escuchando en http://localhost:${port}`);
});
