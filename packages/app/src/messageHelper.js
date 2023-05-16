import axios from 'axios';

const whatsappToken = process.env.WHATSAPP_TOKEN;

const commonWhatsappCallData =  {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    
};

async function rawWhatsappMessage(data){
    const headers = {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
    };

    return await axios.post('https://graph.facebook.com/v16.0/109457618815544/messages', data, { headers })
        .then(response => {
            console.log('Request successful:', response.data);
        })
        .catch(error => {
            console.error('Error:', error.response.data);
    });

}

export async function sendInteractiveMessage(to,data){
    const body = {
        ...commonWhatsappCallData,
        to,
        type: "interactive",
        interactive: data
    }

    await rawWhatsappMessage(body);
}

export async function sendTextMessage( to, message) {
    console.log("sendMessage function called");

    const data = {
        ...commonWhatsappCallData,
        to,
        type: 'text',
        text: {
            preview_url: false,
            body: message
        }
    };

    console.log({data});

    await rawWhatsappMessage(data);

    
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
