import { Injectable } from '@nestjs/common';
const Imap = require('imap');
import { simpleParser } from 'mailparser';
import { FilebaseService } from '../filebase/filebase.service';
import { MessageType, UserData } from '../bot/interface/bot.service';
import { extractUserContent } from 'src/lib/text.mail';
import crypto from 'crypto';
import { formatDate } from 'src/lib/formatDate';
import * as nodemailer from 'nodemailer';
import { getLastPhoto } from 'src/lib/getLastPhoto';

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







  
  private async parseEmail(buffer: string) {
    return new Promise((resolve, reject) => {
      simpleParser(buffer, (err, parsed) => {
        if (err) reject(err);
        else resolve(parsed);
      });
    });
  }







  
  private extractPhoto(attachments: any[]) {
    return [...attachments].reverse().find(
      (att) =>
        att.contentType?.startsWith('image/') &&
        att.size > 1024 &&
        /\.(png|jpe?g|gif)$/i.test(att.filename)
    );
  }







  private async uploadImageAndGetLink(photo: any) {
    const attachment = {
      content: photo.content,
      filename: photo.filename || `image_${Date.now()}.png`,
      contentType: photo.contentType || 'image/png'
    };
  
    const imageUrl = await this.firebaseService.uploadBufferToFirebase(
      attachment.content,
      `email_${Date.now()}_${attachment.filename}`,
      attachment.contentType
    );
  
    const sizeInKB = photo.size ? (photo.size / 1024).toFixed(1) : undefined;
    const sizeInMb = photo.size ? (photo.size / 1024 / 1024).toFixed(1) : undefined;
    const size = Number(sizeInMb) < 1 ? `${sizeInKB} kb` : `${sizeInMb} mb`;
  
    return {
      url: imageUrl,
      type: 'img',
      name: photo.filename,
      size
    };
  }






  private async saveUserIfNotExists(userId: string, userName: string, email: string) {
    const existingUser = await this.firebaseService.findOneUser(userId);
    if (!existingUser) {
      const userData: UserData = {
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





  
  private async saveMessage(userId: string, termText: string, linkData: MessageType['link'], messageId: string) {
    const messageData: MessageType = {
      role: 'mail',
      userId,
      message: termText,
      messageId,
      link: linkData,
      createAt: formatDate(),
      newMessage: true
    };
  
    console.log(messageData);
    await this.firebaseService.createMessage(messageData);
    console.log('✅ Message created');
  }






  private fetchLatestEmail() {
    this.imap.search(['UNSEEN'], (err, results) => {
      if (err || !results.length) return;
      const latest = results[results.length - 1];
      const f = this.imap.fetch(latest, { bodies: '' });
  
      f.on('message', (msg: any) => {
        let buffer = '';
        msg.on('body', (stream: any) => {
          stream.on('data', (chunk: any) => (buffer += chunk.toString('utf8')));
  
          stream.once('end', async () => {
            try {
              const parsed: any = await this.parseEmail(buffer);
              const { from, text, attachments, messageId } = parsed;
  
              const email = from?.value?.[0]?.address || '';
              const userId = crypto.createHash('md5').update(email).digest('hex');
              const userName = from?.value?.[0]?.name || email;
              const termText = extractUserContent(text);
              const photo = this.extractPhoto(attachments);
              const lastPhoto = getLastPhoto(attachments)
              
              let linkData: MessageType['link'] = null;
              if (lastPhoto?.content?.filename !== photo?.filename ) {
                console.log(1);
                
                linkData = await this.uploadImageAndGetLink(photo);
              }
              
              await this.saveUserIfNotExists(userId, userName, email);
  
              if (termText.text || linkData?.url) {
                await this.saveMessage(userId, termText.text, linkData, messageId);
              } else {
                console.log('📭 No text or image. Message skipped.');
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
