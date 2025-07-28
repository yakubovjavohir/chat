import { Injectable } from '@nestjs/common';
import { Bot } from "grammy";
import { MessageType, UserData } from './interface/bot.service';
import { FilebaseService } from '../filebase/filebase.service';
import path from 'path';
import { formatDate } from 'src/lib/formatDate';
var userProfilePhotoUrl = ''
@Injectable()
export class BotService {
  private bot : Bot
  constructor(private readonly filebaseService: FilebaseService){
    this.bot = new Bot(process.env.BOT_TOKEN!)
    this.chatBot()
  }
  async chatBot() {
    // start bot
    this.bot.start()



    this.bot.command("start", async (contex)=>{
      const userId = contex.message?.from.id as number
      const userPhotos = await contex.api.getUserProfilePhotos(userId);
      if (userPhotos.total_count === 0) {
        userProfilePhotoUrl = ""
      } else {
        const fileId = userPhotos.photos[0][0].file_id; 
        const file = await contex.api.getFile(fileId);
        const botToken = process.env.BOT_TOKEN;
        const url = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
        const fileName = `bot_${userId}_${Date.now()}.profile_img`;
    
        userProfilePhotoUrl = await this.filebaseService.uploadTelegramFileToFirebase(url, fileName);
      }
      await contex.reply("Assalomu aleykum hurmatli mijoz savolingzi berishdan oldin malumotlaringzni olishmiz kerak! Telefon raqamizni yozing ☎️ namuna : +998991234567")
    })

    this.bot.on("message:text", async (context) => {
          let phone = context.message.text;
          const userId = context.message.from.id;
          const userName = context.message.from.first_name;

          if (phone.length === 9) phone = '+998' + phone;
          if (phone.length === 12) phone = '+' + phone;

          const data = await this.filebaseService.findAllUser();
          const res = data || []

          
          if (/^\+998\d{9}$/.test(phone)) {

              const alreadyUser = res.find((user: UserData) => user.userId === userId);
              const alreadyPhone = res.find((user: UserData) => user.phone === phone);

              if (alreadyUser) {
                await context.reply("Siz allaqachon ro'yxatdan o'tgansiz! Savolingizni yuboring 😊");
                return
              } else if (alreadyPhone) {
                await context.reply("Bu raqam allaqachon ro'yxatdan o'tgan! 😕");
                return
              } else {

                const newUser:UserData = {
                  userName,
                  userId,
                  role:"bot",
                  phone,
                  privateNote: "",
                  service:"telegram_bot",
                  email:'',
                  createAt: formatDate(),
                  profilePhoto:userProfilePhotoUrl
                };  
                await this.filebaseService.createUser(newUser);
                await context.reply("Raqamingiz qabul qilindi! Endi savolingizni yuboring 😊");
                return
              }
          }

          const isExist = res.find((el: UserData) => el.userId === userId);
          
          if (!isExist) {
            await context.reply('Suhbatni boshlashdan oldin telefon raqamingizni kiritishingiz kerak!');
            return;
          }


          

          const text = context.message.text;
          const foundUser = res.find((user: UserData) => user.userId === userId);
          if (foundUser) {
            const data:MessageType = {
              role:"bot",
              userId: context.message.from.id as number,
              message: text,
              link:{
                url:'',
                type:'',
                name:''
              },
              messageId: context.message.message_id,
              createAt: formatDate(),
              newMessage:true
            }

            await this.filebaseService.createMessage(data);
            return
          }
    });


    this.bot.on("message:document", async (ctx) => {  
      const extension = path.extname(ctx.message.document.file_name as string);  
      const userId = ctx.message.from.id;
      const fileId = ctx.message.document.file_id;
      const file = await this.bot.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN!}/${file.file_path}`;
      
      const fileName = `bot_${userId}_${Date.now()}` + `.${extension}`;

      const firebaseUrl = await this.filebaseService.uploadTelegramFileToFirebase(fileUrl, fileName);
      const message = ctx.message.caption || ""

  
      const data = await this.filebaseService.findAllUser();
      const existing = data;

      const user = existing.find((el: UserData) => el.userId === userId);
      if (!user) return ctx.reply("Suxbatni boshlashdan oldin telefon raqamizni kirtshingz kerak!");

      const messageData:MessageType = {
        userId,
        role:"bot",
        messageId:ctx.message.message_id,
        message: message,
        link: {
          url:firebaseUrl,
          type:'file',
          name:''
        },
        createAt: formatDate(),
        newMessage: true
      }

      await this.filebaseService.createMessage(messageData);
    });


    this.bot.on("message:voice", async (ctx) => {
      const ext = ctx.message.voice.mime_type?.split('/')[1] as string
      const userId = ctx.message.from.id;
      const fileId = ctx.message.voice.file_id;
      const file = await this.bot.api.getFile(fileId);
      const voiceUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN!}/${file.file_path}`;
      
      const fileName = `bot_${userId}_${Date.now()}` + `.${ext}`;

      const firebaseUrl = await this.filebaseService.uploadTelegramFileToFirebase(voiceUrl, fileName);

      const data = await this.filebaseService.findAllUser();
      const existing = data || [];

      const user = existing.find((el: UserData) => el.userId === userId);
      if (!user) return ctx.reply("Suxbatni boshlashdan oldin telefon raqamizni kirtshingz kerak!");

      const messageData:MessageType = {
        userId,
        role:"bot",
        messageId:ctx.message.message_id,
        message: "",
        link: {
          url:firebaseUrl,
          type:'voice',
          name:''
        },
        createAt: formatDate(),
        newMessage: true
      }

      await this.filebaseService.createMessage(messageData);
    });


    this.bot.on("message:photo", async (ctx) => {
      
      const photo = ctx.message.photo;
      const fileId = photo[photo.length - 1].file_id;
      
      const userId = ctx.message.from.id

      const file = await this.bot.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    
      const fileName = `bot_${userId}_${Date.now()}.img`;
    
      const firebaseUrl = await this.filebaseService.uploadTelegramFileToFirebase(fileUrl, fileName);
    
      const message = ctx.message.caption || "";
    
      const data = await this.filebaseService.findAllUser();
      const existing = data || [];
      const user = existing.find((el: UserData) => el.userId === userId);
    
      if (!user) return ctx.reply("Suxbatni boshlashdan oldin telefon raqamingizni kiriting!");
    
      const messageData:MessageType = {
        userId,
        role:"bot",
        messageId: ctx.message.message_id,
        message,
        link: {
          url:firebaseUrl,
          type:'img',
          name:''
        },
        createAt: formatDate(),
        newMessage: true,
      }
    
      await this.filebaseService.createMessage(messageData);
    });
    

    this.bot.on("edited_message:text", async (ctx) => {
      const userId = ctx.editedMessage.from.id;
      const newText = ctx.editedMessage.text;
      const messageId = ctx.editedMessage.message_id;

      const data = await this.filebaseService.findAllUser();
      const existing = data || [];

      const user = existing.find((el: UserData) => el.userId === userId);
      if (!user) {
        await ctx.reply("Suxbatni boshlashdan oldin telefon raqamizni kirtshingz kerak!");
        return;
      }  

      const allMessages = await this.filebaseService.findAllMessages()

      for (let i = 0; i < allMessages.length; i++) {
        const element = allMessages[i];
        if(element.message_id == messageId){
          const messageData:MessageType = {
            userId,
            role:"bot",
            messageId: messageId,
            message:newText,
            link: element.link,
            createAt: element.createAt,
            newMessage:element.newMessage
          }
          await this.filebaseService.updateMessage(messageData);
          return 
        }
      }
    });
  }

    async editMessage(data: MessageType) {
      try {
        const messageId = data.messageId as number;
        const userId = data.userId as number;
        const oldMessage = await this.filebaseService.findOneMessage(userId, messageId)
        if(oldMessage?.message  === data.message){
          return  
        }      
        await this.filebaseService.updateMessage(data);
        if (data.link.type === 'voice' || data.link.type === 'img' || data.link.type === 'file') {
          await this.bot.api.editMessageCaption(userId, messageId, {
            caption: data.message,
          });
        }
        await this.bot.api.editMessageText(userId, messageId, data.message); 
    
        return {
          message:"success",
          data
        };
      } catch (error) {
        throw new Error('error editMessage: ' + error.message);
      }
    }
  

  async sendMessage(data:MessageType) {
    try {          
        if (data.message) {
          const sent = await this.bot.api.sendMessage(data.userId!, data.message);
          data.messageId = sent.message_id
        }

        if (data.link && data.link?.type === "file" && data.link.url) {
          const sent = await this.bot.api.sendDocument(data.userId!, data.link.url);
          data.messageId = sent.message_id
        }

        if (data.link && data.link?.type === "img" && data.link.url) {
          const sent = await this.bot.api.sendPhoto(data.userId!, data.link.url);
          data.messageId = sent.message_id
        }

        if (data.link && data.link?.type === "voice" && data.link.url) {
          const sent = await this.bot.api.sendVoice(data.userId!, data.link.url);
          data.messageId = sent.message_id
        }
        data.newMessage = false
        await this.filebaseService.createMessage(data)
        return {
          message:"success",
          data
        }
    } catch (error) {
      throw new Error('error sendMessage : ' + error);
    }
  }

  async deleteMessage(messageId: number, data: MessageType) {
    try {
      const chatId = data.userId as number;
      await this.filebaseService.deleteMessage(messageId, chatId);
      await this.bot.api.deleteMessage(chatId, messageId);
      return {
        message:"success"
      }
    } catch (error) {
      throw new Error("O‘chirib bo‘lmadi");
    }
  }
  
}
