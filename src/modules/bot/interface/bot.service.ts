export interface MessageType {
    role:string,
    userId?:number
    message:string,
    messageId:number,
    link:{
        url?:string,
        type?:string,
        name?:string
    }
    createAt:string,
    newMessage:boolean
}

export interface UserData {
    role:'bot' | 'admin',
    userId:number,
    userName:string,
    phone:string,
    privateNote?:string,
    service:'telegram_bot',
    email:string,
    createAt:string,
    profilePhoto:string
}