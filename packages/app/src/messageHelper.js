import axios from 'axios';

export function sendMessage(token, waID, message) {
    const config = {
        method: "POST",
        url: 'https://graph.facebook.com/v16.0/109457618815544/messages',
        Headers: {
            'Authorization': `Bearer ${token}}`,
            'Content-Type': 'application/json'
        },
        data: `{
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": ${waID},
                    "type": "text",
                    "text": {
                      "preview_url": false,
                      "body": ${message}
                    }
                }`
    }
    return axios(config)
}

export function sendTemplateMessage(data, token) {
    const config = {
        method: "POST",
        url: 'https://graph.facebook.com/v16.0/109457618815544/messages',
        Headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data
    }
    return axios(config)
}
