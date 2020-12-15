import UserModel from "../models/user.model";
import { Helper } from "../helper/helper";
import jwt from "jsonwebtoken";
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
let request = require("request-promise");
const cookieJar = request.jar();
request = request.defaults({jar:cookieJar});

export class HomeController {
  public async signUp(params: any) {
    if (params.password !== params.cpassword) {
      throw "Password and Confirm password not matched";
    }
    var emailexist = await UserModel.findOne({ email: params.email });
    if (emailexist) {
      throw "Email address already exists";
    }
    const userModel = new UserModel(params);
    await userModel.save();
  }
  public async signIn(params: any) {
    var data: any = await UserModel.findOne({ email: params.email });
    if (!data) {
      throw "Email address doesnot exists";
    }
    var user: any = await Helper.compareEncHash(params.password, data.password);
    if (!user) {
      throw "Incorrect password";
    }
    return data;
  }

  public async optionSweeps(){
  let options =  {
    uri: 'https://app.flowalgo.com/',
    headers: {
      cookie:`__cfduid=d514909d32763d0a915a0e04a03d2dec61607677632; _ga=GA1.2.1012676477.1607657836; intercom-id-dtoll8e6=d040fea3-be4b-4a70-af56-58794639990a; ext_name=ojplmecpdpgccookcobabopnaifgidhf; _gid=GA1.2.1174731054.1607937839; _gat_gtag_UA_105239038_2=1; PHPSESSID=1aad1eb96af62c8d414b714552fe997a; intercom-session-dtoll8e6=VlVhYklJbXVuV3J4YXh2YmFpNXpjWWpsU21nYWxaNW9adklQajVBcGtOTUUzY2pUN3I1ZVpsVzNZU2RBZ0Rrai0tSXI5U1c1SDNSa1RkU05rcTdhTFplUT09--ed9302e350396d2056fb2b853ec9178b45690b12; amember_nr=f8792311f38d240f96d6df6b538700ef; wordpress_logged_in_d1f53b3265d55ab79282aac86fcd5ba4=bugsbunny%7C1608130477%7CXjgi4Z6VNI7hpu4aZCnFaAy91VnYkr8iAlNyFEmAnmj%7C0fbe45f47240befe37f129763834a822470009600bc7bb7cc97a0487792b7be9; mp_cef79b4c5c48fb3ec3efe8059605ec56_mixpanel=%7B%22distinct_id%22%3A%2018351%2C%22%24device_id%22%3A%20%22176549be149656-01bcb5c80fc4a8-c791039-1fa400-176549be14ad1b%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fflowalgo.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22flowalgo.com%22%2C%22%24user_id%22%3A%2018351%7D`
    },
    method: "POST",
    json: true,
  };
    let resFromAPI = [];
    let data:any = [];
    await request(options, (error:any, response:any, html:any) => {
    if(!error && response.statusCode == 200) {
      
        const $ = cheerio.load(html);
        const tableData = $('.component-body>.data-body>.item');
        
        
        tableData.each(function(i:any, elem:any) {
          data.push({
            time: $(elem).find('.time>span').text(),
            ticker: $(elem).find('.ticker>span').text(),
            type: $(elem).find('.type>span').text(),
            expiry: $(elem).find('.expiry>span').text(),
            strike: $(elem).find('.strike>span').text(),
            premium: $(elem).find('.premium>span').text()
          })
        });
    }
  })
  return data;
}

  public async verifEmail(token: string) {
    var decodedtoken = await jwt.verify(token, process.env.ACTIVATIONKEY || "");
    if (decodedtoken) {
      const userModel = new UserModel(decodedtoken);
      await userModel.save();
    }
  }
  public async sendVerificationEmail(params: any, token: any) {
    await Helper.sendEmail(params, token);
  }
}
