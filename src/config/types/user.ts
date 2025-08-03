export interface UserData {
    id?:string
    role:'bot' | 'admin' | 'email',
    userId?:number | string,
    userName:string,
    phone:string,
    privateNote?:string,
    service:'telegram_bot' | 'gmail',
    email?:string,
    createAt:string,
    profilePhoto?:string
}