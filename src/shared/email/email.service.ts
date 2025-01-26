import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor() {
    // TODO IF NEED
  }

  /**
   * EMAIL METHODS
   * getDateString
   */
  async sendEmail(name, email, file): Promise<ResponsePayload> {
    try {
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
      const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
      const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

      const oAuth2Client = new google.auth.OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          REDIRECT_URI
      );
      oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

      const accessToken = await oAuth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'info@mkshippinglines.com',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });


      const emailFrom = 'info@mkshippinglines.com'
      const toReceiver = email;


      const info = await transporter.sendMail({
        from: `"MK shipping Lines" <${emailFrom}>`,
        replyTo: emailFrom,
        to: toReceiver, //receiver
        subject: 'Thanks for your Cabin rentals.', // Subject line
        // text: "Hello this is text body", // plain text body
        html: `
            <p>Hi: (${name})</p>
            <p>We have completed your Cabin rentals. We hope you will enjoy travelling with us.</p>
            <p>Thanks for travelling with us.</p>
            <p>MK Shipping Lines</p>
            <p>Download App: <a href="https://rb.gy/aia3mx">https://rb.gy/aia3mx</a></p>
            `, // html body
        attachments: [{
          filename: `.pdf`, //my pdf name
          path: file, // the pdf content
          contentType: 'application/pdf' //Content type
        }]
      });

      return {
        success: true,
        message: 'Data Added Success',
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
