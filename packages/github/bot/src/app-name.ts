// import { defineString } from 'firebase-functions/params';
//
// export const appName = defineString('APP_NAME');
export const appName = process.env.APP_NAME as string;
