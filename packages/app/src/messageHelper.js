import axios from 'axios';

const whatsappToken = process.env.WHATSAPP_TOKEN;

export async function sendMessage( waID, message) {
    console.log("sendMessage function called");

    const data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: waID,
        type: 'text',
        text: {
            preview_url: false,
            body: message
        }
    };

    const headers = {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
    };

    axios.post('https://graph.facebook.com/v16.0/109457618815544/messages', data, { headers })
        .then(response => {
            console.log('Request successful:', response.data);
        })
        .catch(error => {
            console.error('Error:', error.response.data);
        });

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
