import axios from 'axios';

const whatsappToken = process.env.WHATSAPP_TOKEN;
const phoneNumberID = process.env.PHONE_NUMBER_ID;
const apiVersion = process.env.WEBHOOK_API_VERSION;

const commonWhatsappCallData =  {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
};

async function rawWhatsappMessage(data){
    const headers = {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
    };

    return await axios.post(`https://graph.facebook.com/${apiVersion}/${phoneNumberID}/messages`, data, { headers })
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
    try{
        console.log("sending interactive messages");
        await rawWhatsappMessage(body);
        console.log("message sent");
    }
    catch(error){
        console.log("Failed to send message");
        throw error;
    }
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
    try{
        await rawWhatsappMessage(data);
        console.log("Text message sent: ", message);
    }
    catch(error){
        console.log("Failed to send message");
    }
}

export async function sendQuestion(to, question_text, options, quuid, expectedAns, wfID) {
    console.log("Type of expected Answer is :", typeof expectedAns);
    const messageID = options.map( (option) => {
        return JSON.stringify({
            type: "QA",
            questionUUID: quuid,
            value: option,
            expectedAns: expectedAns,
            wfID: wfID
        })
    })

        const buttons = options.map( (option, index) => {
            return {
                type: "reply",
                reply: {
                    title: option,
                    id: messageID[index],
                }
            }
        })

        await sendInteractiveMessage(to, {
        body: {
            text: question_text
        },
        type: "button",
        action: { buttons: buttons }
       });
}

export async function sendLink(to,fileName,fileLink) {
    const data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "PHONE_NUMBER",
        "type": "template",
        "template": {
          "name": "TEMPLATE_NAME",
          "language": {
            "code": "LANGUAGE_AND_LOCALE_CODE"
          },
          "components": [
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": fileName
                },
              ]
            },
            {
                "type": "text",
            }
          ]
        }
      }

      await rawWhatsappMessage(data);
}
