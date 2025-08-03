import { Injectable } from '@nestjs/common';
const Imap = require('imap');
import { simpleParser } from 'mailparser';
import { FilebaseService } from '../filebase/filebase.service';
import { MessageType } from '../../config/types/message';
import { UserData } from '../../config/types/user';
import { extractUserContent } from 'src/lib/text.mail';
import crypto from 'crypto';
import { formatDate } from 'src/lib/formatDate';
import * as nodemailer from 'nodemailer';
import { v4 } from 'uuid';
import axios from 'axios';



@Injectable()
export class MailService {
  private imap: any;
  private transporter: nodemailer.Transporter;




  constructor(private readonly firebaseService: FilebaseService) {
    this.initTransporter();       
    this.reconnectToIMAP();          
  }



  private initTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CHAT_MAIL,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }




  private createIMAPInstance() {
    return new Imap({
      user: process.env.CHAT_MAIL,
      password: process.env.EMAIL_APP_PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: { interval: 10000, idleInterval: 300000, forceNoop: true }
    });
  }
  




  private reconnectToIMAP() {
    this.imap = this.createIMAPInstance();
    this.imap.once('ready', () => this.listenInbox());
    this.imap.once('error', (err) => console.error('IMAP error:', err));
    this.imap.once('end', () => {
      console.warn('🔁 IMAP connection closed. Reconnecting...');
      setTimeout(() => this.reconnectToIMAP(), 5000);
    });
  
    this.imap.connect();
  }





  private listenInbox() {
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) throw err;
      console.log('📥 INBOX ochildi. Yangi xabarlarni kutayapmiz...');
      this.imap.on('mail', () => {
        this.fetchLatestEmail();
      });
    });
  }







  
  private async parseEmail(buffer: Buffer) {
    return new Promise((resolve, reject) => {
      simpleParser(buffer, (err, parsed) => {
        if (err) reject(err);
        else resolve(parsed);
      });
    });
  }







  
  private extractPhoto(attachments:any) {
    if (!attachments || !attachments.length) return null;
  
    const image = attachments.find(att =>
      att.contentType?.startsWith('image/')
    );
  
    if (!image) return null;
  
    return {
      name: image.filename,
      content: image.content,
      size: image.size,
      checksum: image.checksum,
      mime: image.contentType,
    };
  }






  private extractFile(attachments: any) {
    if (!attachments || !attachments.length) return null;
  
    const file = attachments.find(att =>
      !att.contentType?.startsWith('image/') // image bo‘lmagan fayllar
    );
  
    if (!file) return null;
  
    return {
      name: file.filename || `file_${Date.now()}`,
      content: file.content,
      size: file.size,
      checksum: file.checksum,
      mime: file.contentType || 'application/octet-stream',
    };
  }






  private getFileType(filename: string): 'img' | 'pdf' | 'doc' | 'file' | 'md'{
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'file';
  
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'img';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['md'].includes(ext)) return 'md';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    return 'file';
  }







  private async uploadImageAndGetLink(photo: any, userId:string | number) {
    const attachment = {
      content: photo.content,
      filename: photo.name || `image_${Date.now()}.png`,
      contentType: photo.mimeType || 'image/png',
    };

    const imageUrl = await this.firebaseService.uploadBufferToFirebase(
      attachment.content,
      `email_${userId}_${Date.now()}_${this.getFileType(photo.name)}`,
      attachment.contentType
    );
  
    const sizeInKB = photo.size ? (photo.size / 1024).toFixed(1) : undefined;
    const sizeInMb = photo.size ? (photo.size / 1024 / 1024).toFixed(1) : undefined;
    const size = Number(sizeInMb) < 1 ? `${sizeInKB} kb` : `${sizeInMb} mb`;
  
    return {
      url: imageUrl,
      type: attachment.contentType,
      name: photo.name,
      size
    };
  }





  private async uploadFileAndGetLink(file: any, userId:string | number) {
    const attachment = {
      content: file.content,
      filename: file.name || `file_${Date.now()}`,
      contentType: file.mime || 'application/octet-stream',
    };
    
    const fileUrl = await this.firebaseService.uploadBufferToFirebase(
      attachment.content,
      `email_${userId}_${Date.now()}_${this.getFileType(file.name)}`,
      attachment.contentType
    );

    const sizeInKB = file.size ? (file.size / 1024).toFixed(1) : undefined;
    const sizeInMb = file.size ? (file.size / 1024 / 1024).toFixed(1) : undefined;
    const size = Number(sizeInMb) < 1 ? `${sizeInKB} kb` : `${sizeInMb} mb`;

    return {
      url: fileUrl,
      type: attachment.contentType,
      name: file.name,
      size
    };
  }






  private async saveUserIfNotExists(id: string, userName: string, email: string, userId:string | number) {
    const existingUser = await this.firebaseService.findOneUser(id);
    if (!existingUser) {
      const userData: UserData = {
        id:v4(),
        role: 'email',
        userId,
        userName,
        phone: '',
        privateNote: '',
        service: 'gmail',
        email,
        createAt: formatDate(),
        profilePhoto: ''
      };
      await this.firebaseService.createUser(userData);
      console.log('✅ User created');
    }
  }






  
  private async saveMessage(userId: string | number, termText: string, linkData: MessageType['link'], messageId: string, role: string) {
    const messageData: MessageType = {
      role: role,
      userId,
      message: termText,
      messageId,
      link: linkData,
      createAt: formatDate(),
      newMessage: true,
      subject: ''
    };
  
    await this.firebaseService.createMessage(messageData);
    console.log('✅ Message created');
  }






  private async replyMessage(userId: string | number, subject:any, termText: string, linkData: MessageType['link'], messageId: string, role: string, inReplyId: string | number){
    const messageData: MessageType = {
      role: role,
      userId,
      message: termText,
      messageId,
      link: linkData,
      createAt: formatDate(),
      newMessage: true,
      subject,
      inReplyId
    };

    await this.firebaseService.createMessage(messageData)
  }





  async sendEmail(userId: string | number, email: string, subject: string | null, message: string, link: any[], role: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.CHAT_MAIL, 
        pass: process.env.EMAIL_APP_PASSWORD, 
      },
    });
    const response = await axios.get(
      'https://storage.googleapis.com/nolbir-io-4464-58b8d.firebasestorage.app/bot_5843145098_1754032535387.img',
      { responseType: 'arraybuffer' }
    );
    const linkData = [
      {
        filename:link[0]?.name,
        content: Buffer.from(response.data) ,
      }
    ]

    const mailOptions = {
      from: process.env.MAIL_USER,
      to:email,
      subject,
      text:message || '',
      attachments: linkData || [],
    };

    let processedLinkData: MessageType['link'] = null;

    if (link[0].url) {
      const attachment = link[0]; 
      processedLinkData = {
        url: attachment?.url, 
        type: attachment?.type, 
        name: attachment?.name,
        size: attachment?.size,
      };
    }

    const sendData = await transporter.sendMail(mailOptions);
    const data = await this.saveMessage(userId, message, processedLinkData, sendData.messageId, role);
    return data;
  }







  private fetchLatestEmail() {
    this.imap.search(['UNSEEN'], (err, results) => {
      if (err || !results.length) return;
      const latest = results[results.length - 1];
      const f = this.imap.fetch(latest, { bodies: '' });
  
      f.on('message', (msg: any) => {
        msg.on('body', (stream: any) => {
          const buffer: Buffer[] = [];

          stream.on('data', (chunk) => {
            buffer.push(chunk);
          });
  
          stream.once('end', async () => {
            try {
            const fullBuffer = Buffer.concat(buffer)
            const parsed: any = await this.parseEmail(fullBuffer);
            const { from, text, attachments, messageId, inReplyTo, references, subject } = parsed;
              
            const email = from?.value?.[0]?.address || '';
            const userId = crypto.createHash('md5').update(email).digest('hex');
            const userName = from?.value?.[0]?.name || email;
            const termText = extractUserContent(text);

            const photo = this.extractPhoto(attachments);
            const hasPhoto = !!photo;

            const file = this.extractFile(attachments);
            const hasFile = !!file;

            const hasText = !!termText.text?.trim()
            
            

            await this.saveUserIfNotExists(v4(), userName, email, userId);

            let linkData: MessageType['link'] = null;

            if(inReplyTo){
              await this.replyMessage(userId, subject, hasText ? termText.text : '', linkData, messageId, 'email', inReplyTo)
              console.log('success reply message');
              
              return
            }
            

            if (hasFile) {
              const fileLinkData = await this.uploadFileAndGetLink(file, userId);
              await this.saveMessage(userId, '', fileLinkData, messageId, 'email');
              return
            }

            if (hasPhoto && !hasText) {
              linkData = await this.uploadImageAndGetLink(photo, userId);
            }
            
            if (hasPhoto || hasText) {
              await this.saveUserIfNotExists(v4(), userName, email, userId);
              await this.saveMessage(userId, hasText ? termText.text : '', linkData, messageId, 'email');
              return
            }

        } catch (e) {
          console.error('Xatolik:', e);
        }
      });

        });
      });
  
      f.once('error', (err) => console.error('Fetch xato:', err));
    });
  }
  
}
