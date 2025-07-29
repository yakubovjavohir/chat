import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import serviceAccount from '../../config/filebase/nolbir-io-4464-58b8d-firebase-adminsdk-fbsvc-9306551fc8.json';
import { Bucket } from '@google-cloud/storage';
import * as fetch from 'node-fetch';
import { MessageType, UserData } from '../bot/interface/bot.service';

@Injectable()
export class FilebaseService {
  private db: FirebaseFirestore.Firestore;
  private storage: Bucket;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: 'nolbir-io-4464-58b8d.firebasestorage.app',
      });
    }

    this.db = admin.firestore();
    this.storage = admin.storage().bucket();
  }

  async findAllUser() {
    try {
      const snapshot = (await this.db.collection('users').get());
      const allData:UserData[] = []
      for (let i = 0; i < snapshot.docs.length; i++) {
        const element = snapshot.docs[i].data();
        allData.push(element as unknown as UserData)
      }
      return allData;
    } catch (error) {
      throw new Error('error firebase findAllUser function : ' + error);
    }
  }

  async findAllMessages() {
    try {
      const snapshot = (await this.db.collectionGroup('allMessages').get());
      
      const allData:any[] = []
      for (let i = 0; i < snapshot.docs.length; i++) {
        const element = snapshot.docs[i].data();
        allData.push({
          message_id:snapshot.docs[i].id,
          ...element
        })
      }
      return allData;
    } catch (error) {
      throw new Error('error firebase findAllMessages function : ' + error);
    }
  }

  async findOneUser(userId:string | number){
    try {
      return (await this.db.collection('users').doc(`${userId}`).get()).data();
    } catch (error) {
      throw new Error('error firebase findOneUser functin: ', error)
    }
  }

  async createUser(data:UserData) {
    try {
      const userId = data.userId;
      await this.db.collection('users').doc(`${userId}`).set(data);
    } catch (error) {
      throw new Error('error firebase createUser function : ' + error);
    }
  }

  async createMessage(data:MessageType) {
    try {
      const userId = data.userId;
      await this.db.collection('messages').doc(`${userId}`).collection('allMessages').doc(`${data.messageId}`).set({
        role:data.role,
        message:data.message,
        createAt:data.createAt,
        link:data.link == null ? null : data.link,
        newMessage:data.newMessage
      });
    } catch (error) {
      throw new Error('error firebase createMessage function : ' + error);
    }
  }

  async findOneMessage(userId:number, messageId:number){
    try {
      return (await this.db.collection('messages').doc(`${userId}`).collection('allMessages').doc(`${messageId}`).get()).data()
    } catch (error) {
      throw new Error('error firebase findOneMessagec: '+ error)
    }
  }

  async updateMessage(data:MessageType){
    try {
      const userId = data.userId
      const messageId = data.messageId
      await this.db.collection("messages").doc(`${userId}`).collection('allMessages').doc(`${messageId}`).update({
        role:data.role,
        message:data.message,
        createAt:data.createAt,
        link:data.link,
        newMessage:data.newMessage,
        editMessage:'edit_message'
      })
    } catch (error) {
      throw new Error('error firebase updateMessage function : ', error)
    }
  }

  async updateUserContact(data:UserData, userId:string | number){
    try {
      const updateData = await this.db.collection(`users`).doc(`${userId}`).update({
        email:data.email,
        phone:data.phone,
        privateNote:data.privateNote,
        profilePhoto:data.profilePhoto,
        role:data.role,
        service:data.service,
        userId:data.userId,
        userName:data.userName,
        createAt:data.createAt
      })
      return {
        message:"success",
        updateData
      }
    } catch (error) {
      throw new Error('error firebase updateUserContact function : ' + error)
    }
  }

  async deleteMessage(messageId:number, userId:number){
    try {
      await this.db.collection('messages').doc(`${userId}`).collection('allMessages').doc(`${messageId}`).delete()
    } catch (error) {
      throw new Error('error firebase deleteMessage function : ', error)
    }
  }

  async uploadTelegramFileToFirebase(fileUrl: string, fileName: string): Promise<string> {
    try {
      const response = await fetch.default(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileUpload = this.storage.file(fileName);
      await fileUpload.save(buffer, {
        metadata: {
          contentType: 'application/octet-stream',
        },
      });

      await fileUpload.makePublic();

      const publicUrl = `https://storage.googleapis.com/${this.storage.name}/${fileName}`;
      return publicUrl;
    } catch (error) {
      throw new Error("error Firebase Storage function :", error);
    }
  }

  async uploadBufferToFirebase(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const fileUpload = this.storage.file(fileName);
      await fileUpload.save(buffer, {
        metadata: {
          contentType: contentType,
        },
      });
  
      await fileUpload.makePublic();
  
      const publicUrl = `https://storage.googleapis.com/${this.storage.name}/${fileName}`;
      return publicUrl;
    } catch (error) {
      throw new Error("error Firebase Buffer Upload function :" + error);
    }
  }
  
}
