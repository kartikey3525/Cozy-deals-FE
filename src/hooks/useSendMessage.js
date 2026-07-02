import React from 'react';
import {useState} from 'react'; 

export default function useSendMessage() {
  const [response, setResponse] = useState(null);
  const FIREBASE_API_KEY =
    'AAAATz6kq3I:APA91bEJ1zfNoWyPfIUz80TLBfYMxPHzg3dWe1PKXOxgsUx78P5HIMfwGvmLbDilzt4Ski1MUQkkw_ckYSPez9_AQeMWNdHFXGG05r2YbrOcDoEtvqrtMmVxLixDRf6jmxlOVZOrxb7I';
  //the  rest  api for sending message from one device to another //

  let headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: 'key=' + FIREBASE_API_KEY,
  });

  const sendMessage = async (
    title,
    message,
    screenType,
    allAdminDeviceToken,
  ) => {
    const messageBody = {
      to: allAdminDeviceToken,
      notification: {
        title: title,
        body: message,
        vibrate: 1,
        sound: 'default',
        show_in_foreground: true,
        priority: 'high',
        content_available: true,
      },
      data: {
        type: screenType,
      },
    };
    try {
      let response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(messageBody),
      });
      let res = await response.json();

      setResponse(res);
    } catch (error) {
      console.log('error ---185', error),  
    }
  };

  return {sendMessage, response};
}
