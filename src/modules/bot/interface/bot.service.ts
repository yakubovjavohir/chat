export interface MessageType {
    role:string,
    userId?:number | string
    message:string,
    messageId:number | string,
    replyId?:number | string,
    link?:{
        url?:string,
        type?:string,
        name?:string,
        size?:string
    } | null
    createAt:string,
    newMessage:boolean
}

export interface UserData {
    role:'bot' | 'admin' | 'mail',
    userId:number | string,
    userName:string,
    phone:string,
    privateNote?:string,
    service:'telegram_bot' | 'mail',
    email:string,
    createAt:string,
    profilePhoto:string
}