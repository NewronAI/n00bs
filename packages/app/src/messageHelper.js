import axios from 'axios';

export function sendMessage (data) {
    const config = {
        method: "POST",
        url: 'https://graph.facebook.com/v16.0/109457618815544/messages',
        Headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: data
    }
    return axios(config)
}

export function getTextMessage (recipent, template_name,data) {
    return JSON.stringify({
        "messaging_product": "whatsapp",
        "to": recipent,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en_uk"
            },
        }
    })
}
