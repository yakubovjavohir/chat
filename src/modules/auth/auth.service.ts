import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../config/filebase/nolbir-io-4464-58b8d-firebase-adminsdk-fbsvc-9306551fc8.json';
import { comparePasswords, hashPassword } from '../../lib/bcrypt';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
    private db: FirebaseFirestore.Firestore;
  constructor(){
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.db = admin.firestore();
  }
 
async findAll() {
  try {
    const snapshot = await this.db.collection('testing').doc('caUBmQcaZHFQgTmexW5k').get();
    
    if (!snapshot.exists) {
      return [];
    }

    const docData = snapshot.data();
    const data = docData?.data || [];

    return data;
  } catch (error) {
    throw new Error('error filebase getTheData: ' + error);
  }
}



 async registration(data:any) {
    try {
      data.id = v4()
      data.password = await hashPassword(data.password)
      const allData = await this.findAll()
      const user = allData.find((el:any)=>{
        return data.email === el.email
      })
      if(user){
        return {
          message:"bu email ro'yxatdan o'tgan!"
        }
      }
      allData.push(data)
      const document = this.db.collection('testing').doc('caUBmQcaZHFQgTmexW5k');
      await document.set({ data:allData });
      return { message: 'create successfully' };
    } catch (error) {
      throw new Error('error filebase update: ' + error);
    }
  }

  async login(data:any){
    try {
      const allData = await this.findAll()
      const user = allData.find((el:any)=>{
        return el.email === data.email
      })

      if(!user){
        return {
          message:"email xato!"
        }
      }
      const isPasswordMatch = await comparePasswords(data.password, user.password);

      if(!isPasswordMatch){
        return {
          message:"password xato!"
        }
      }

        return {
          isAccess:true
        }
      
    } catch (error) {
      console.error("Login xatosi:", error);
      throw new Error("Login jarayonida xatolik yuz berdi.");
    }
  }
}
