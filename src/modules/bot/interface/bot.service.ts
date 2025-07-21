export interface MessageType {
    role:string,
    userId?:number
    message:string,
    messageId:number,
    url?:[string?, string?]
    createAt:string,
    newMessage:boolean
}

export interface UserData {
    role:'bot' | 'admin',
    userId:number,
    userName:string,
    phone:string,
    privateNote?:string,
    service:'telegram_bot'
    createAt:string
}