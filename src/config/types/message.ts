export interface MessageType {
    role:string,
    userId?:number | string
    message:string,
    messageId:number | string,
    replyId?:number | string,
    link?:{
        url?:string,
        type?:string,
        name?:string | undefined,
        size?:string
    } | null
    createAt:string,
    newMessage:boolean
}