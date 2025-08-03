export interface MessageType {
    id?:string
    role:string,
    userId?:number | string
    message:string,
    messageId:number | string,
    link?:{
        url?:string,
        type?:string,
        name?:string | undefined,
        size?:string
    } | null
    createAt:string,
    newMessage:boolean,
    subject:string | null,
    inReplyId?:string | number | null,
}

