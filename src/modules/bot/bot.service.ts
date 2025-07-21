import { Injectable } from '@nestjs/common';
import { Bot } from "grammy";
import { MessageType, UserData } from './interface/bot.service';
import { FilebaseService } from '../filebase/filebase.service';
import path from 'path';
import { formatDate } from 'src/lib/formatDate';

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
      await contex.reply("Assalomu aleykum hurmatli mijoz savolingzi berishdan oldin malumotlaringzni olishmiz kerak! Telefon raqamizni yozing ☎️ namuna : +998991234567")
    })

    // user phone message
    this.bot.on("message:text", async (context) => {
          let phone = context.message.text;
          const userId = context.message.from.id;
          const userName = context.message.from.first_name;

          // Telefon formatlash
          if (phone.length === 9) phone = '+998' + phone;
          if (phone.length === 12) phone = '+' + phone;

          // Firebase dan hozirgi foydalanuvchilarni olish
          const data = await this.filebaseService.findAllUser();
          const res = data || []

          
          // Telefon validatsiya
          if (/^\+998\d{9}$/.test(phone)) {

              // User mavjudligini tekshirish
              const alreadyUser = res.find((user: UserData) => user.userId === userId);
              const alreadyPhone = res.find((user: UserData) => user.phone === phone);

              if (alreadyUser) {
                await context.reply("Siz allaqachon ro'yxatdan o'tgansiz! Savolingizni yuboring 😊");
                return
              } else if (alreadyPhone) {
                await context.reply("Bu raqam allaqachon ro'yxatdan o'tgan! 😕");
                return
              } else {

              // Yangi user qo'shish
                const newUser:UserData = {
                  userName,
                  userId,
                  role:"bot",
                  phone,
                  privateNote: "",
                  service:"telegram_bot",
                  createAt: formatDate()
                };  
                // res.push(newUser);
                await this.filebaseService.createUser(newUser);
                await context.reply("Raqamingiz qabul qilindi! Endi savolingizni yuboring 😊");
                return
              }
          }

          // royxatdan otishdan keyingi message uchun
          

          const isExist = res.find((el: UserData) => el.userId === userId);
          
          if (!isExist) {
            await context.reply('Suhbatni boshlashdan oldin telefon raqamingizni kiritishingiz kerak!');
            return;
          }


          

          // Keyingi xabarni saqlash
          const text = context.message.text;
          const foundUser = res.find((user: UserData) => user.userId === userId);
          if (foundUser) {
            const data:MessageType = {
              role:"bot",
              userId: context.message.from.id as number,
              message: text,
              url:[],
              messageId: context.message.message_id,
              createAt: formatDate(),
              newMessage:true
            }

            // Yangilangan users arrayni yozib qo'yish
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
        url: [firebaseUrl, 'file'],
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
        url: [firebaseUrl, 'voice'],
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
        url: [firebaseUrl, 'img'],
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
            url: element.url,
            createAt: element.createAt,
            newMessage:element.newMessage
          }
          await this.filebaseService.updateMessage(messageData);
          return 
        }
      }


    });
  }

  async sendMessage(data:MessageType) {
    try {          
        if (data.message) {
          const sent = await this.bot.api.sendMessage(data.userId!, data.message);
          data.messageId = sent.message_id
        }

        if (data.url?.[0] && data.url?.[1] === "file") {
          const sent = await this.bot.api.sendDocument(data.userId!, data.url[0]);
          data.messageId = sent.message_id
        }

        if (data.url?.[0] && data.url?.[1] === "img") {
          const sent = await this.bot.api.sendPhoto(data.userId!, data.url[0]);
          data.messageId = sent.message_id
        }

        if (data.url?.[0] && data.url?.[1] === "voice") {
          const sent = await this.bot.api.sendVoice(data.userId!, data.url[0]);
          data.messageId = sent.message_id
        }
        data.newMessage = false
        await this.filebaseService.createMessage(data)
        return
    } catch (error) {
      throw new Error('error sendMessage: ' + error);
    }
  }

  async deleteMessage(messageId: number, data: MessageType) {
    try {
      console.log(messageId, data);
      const chatId = data.userId as number;
  
      await this.filebaseService.deleteMessage(messageId, chatId);
      const result = await this.bot.api.deleteMessage(chatId, messageId);
      console.log(result);
      
      return { success: true };
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      throw new Error("O‘chirib bo‘lmadi");
    }
  }
  
}
