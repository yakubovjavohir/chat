interface Message {
    type: 'text';
    content: string | any;
    createAt: number;
  }
  
  export function getLastMessage(termText: { text: string; createAt?: string }): Message | null {
    const messages: Message[] = [];
  
    if (termText?.text) {
      messages.push({
        type: 'text',
        content: termText.text,
        createAt: termText.createAt ? new Date(termText.createAt).getTime() : Date.now()
      });
    }
    
    if (!messages.length) return null;
    
    return messages.sort((a, b) => b.createAt - a.createAt)[0]; // eng oxirgi
  }
  