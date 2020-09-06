'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')
const debug = require('debug')('services:sendbird-webhooks:post')
const AWS = require('aws-sdk')
const configs = require('../../../configs')

const ses = new AWS.SES({ apiVersion: '2010-12-01', region: configs.awsSESRegion })
/* eslint-disable max-len */
const sendNotificationEmail = async (users, message) => {
  const userEmails = _.map(users, 'email')
  const channelUrl = _.get(message, 'channel.channel_url')
  debug('User emails %O', userEmails)
  const params = {
    Destination: {
      ToAddresses: userEmails // Email address/addresses that you want to send your email
    },
    Message: {
      Body: {
        Html: {
          // HTML Format of the email
          Charset: 'UTF-8',
          Data:
            `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

            <html
              xmlns="http://www.w3.org/1999/xhtml"
              xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:v="urn:schemas-microsoft-com:vml"
            >
              <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <meta content="width=device-width" name="viewport" />
                <title></title>
                <link
                  href="https://fonts.googleapis.com/css?family=Lato"
                  rel="stylesheet"
                  type="text/css"
                />
              </head>
              <body
                class="clean-body"
                style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;"
              >
                <style id="media-query-bodytag" type="text/css">
                  @media (max-width: 640px) {
                    .block-grid {
                      min-width: 320px !important;
                      max-width: 100% !important;
                      width: 100% !important;
                      display: block !important;
                    }
                    .col {
                      min-width: 320px !important;
                      max-width: 100% !important;
                      width: 100% !important;
                      display: block !important;
                    }
                    .col > div {
                      margin: 0 auto;
                    }
                    img.fullwidth {
                      max-width: 100% !important;
                      height: auto !important;
                    }
                    img.fullwidthOnMobile {
                      max-width: 100% !important;
                      height: auto !important;
                    }
                    .no-stack .col {
                      min-width: 0 !important;
                      display: table-cell !important;
                    }
                    .no-stack.two-up .col {
                      width: 50% !important;
                    }
                    .no-stack.mixed-two-up .col.num4 {
                      width: 33% !important;
                    }
                    .no-stack.mixed-two-up .col.num8 {
                      width: 66% !important;
                    }
                    .no-stack.three-up .col.num4 {
                      width: 33% !important;
                    }
                    .no-stack.four-up .col.num3 {
                      width: 25% !important;
                    }
                  }
                </style>
                <table
                  bgcolor="#FFFFFF"
                  cellpadding="0"
                  cellspacing="0"
                  class="nl-container"
                  role="presentation"
                  style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; width: 100%;"
                  valign="top"
                  width="100%"
                >
                  <tbody>
                    <tr style="vertical-align: top;" valign="top">
                      <td
                        style="word-break: break-word; vertical-align: top; border-collapse: collapse;"
                        valign="top"
                      >
                        <div style="background-color:transparent;">
                          <div
                            class="block-grid two-up"
                            style="Margin: 0 auto; min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"
                          >
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"
                            >
                              <div
                                class="col num6"
                                style="max-width: 320px; min-width: 310px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 10px; padding-left: 10px;"
                                  >
                                    <div
                                      align="left"
                                      class="img-container left autowidth"
                                      style="padding-right: 0px;padding-left: 0px;"
                                    >
                                      <div style="font-size:1px;line-height:15px"></div>
                                      <a
                                        href="https://app.peermedical.com/"
                                        target="_blank"
                                      >
                                        <img
                                          alt="Peer Medical"
                                          border="0"
                                          class="left autowidth"
                                          src="https://i.ibb.co/HT7m478/PMLogo.png"
                                          style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; width: 100%; max-width: 172px; display: block;"
                                          title="Peer Medical"
                                          width="172"
                                      /></a>
                                      <div style="font-size:1px;line-height:15px"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                class="col num6"
                                style="max-width: 320px; min-width: 310px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 10px; padding-left: 10px;"
                                  >
                                    <div
                                      style="color:#555555;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;line-height:120%;padding-top:15px;padding-right:0px;padding-bottom:15px;padding-left:0px;"
                                    >
                                      <div
                                        style="font-size: 12px; line-height: 14px; font-family: TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif; color: #555555;"
                                      >
                                        <p
                                          style="font-size: 14px; line-height: 16px; text-align: right; margin: 0;"
                                        ></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="background-color:transparent;">
                          <div
                            class="block-grid"
                            style="Margin: 0 auto; min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"
                          >
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"
                            >
                              <div
                                class="col num12"
                                style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="divider"
                                      role="presentation"
                                      style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                      valign="top"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr style="vertical-align: top;" valign="top">
                                          <td
                                            class="divider_inner"
                                            style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 15px; padding-left: 10px; border-collapse: collapse;"
                                            valign="top"
                                          >
                                            <table
                                              align="center"
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              class="divider_content"
                                              height="0"
                                              role="presentation"
                                              style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 1px solid #dedede; height: 0px;"
                                              valign="top"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr
                                                  style="vertical-align: top;"
                                                  valign="top"
                                                >
                                                  <td
                                                    height="0"
                                                    style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;"
                                                    valign="top"
                                                  >
                                                    <span></span>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <div
                                      style="color:#5ac5c1;font-family:'Lato', Georgia, Times, 'Times New Roman', serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:25px;padding-left:10px;"
                                    >
                                      <div
                                        style="font-size: 12px; line-height: 14px; font-family: 'Lato', Georgia, Times, 'Times New Roman', serif; color: #5ac5c1;"
                                      >
                                        <p
                                          style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;"
                                        >
                                          <strong
                                            ><span
                                              style="font-size: 22px; line-height: 26px;"
                                              >Hello, You have a new message on Peer Medical</span
                                            ></strong
                                          >
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="background-color:transparent;">
                          <div
                            class="block-grid"
                            style="Margin: 0 auto; min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"
                          >
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"
                            >
                              <div
                                class="col num12"
                                style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:10px; padding-right: 0px; padding-left: 0px;"
                                  >
                                    <div style="color:#666;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:50px;padding-bottom:25px;padding-left:50px;">
                                      <div style=" text-align: center; margin: 0 auto; font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #666;" > 
                                        <p style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;" >
                                          To view, please click the button below
                                        </p>
                                        <a
                                          href="https://app.peermedical.com/patient/messages"
                                          style="text-decoration: underline; "
                                        >
                                        <button  style="cursor:pointer; background:#5ac5c1 ;color: white; font-size: 12px; padding:5px 10px; margin:10px auto 0; border:unset;"> View Message </button>
                                        </a>
                                      </div>
                                    </div>
                                    <div
                                      style="color:#666;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:0px;padding-bottom:25px;padding-left:0px;"
                                    >
                                      <div
                                        style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #666;"
                                      >
                                        <p
                                          style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;"
                                        >
                                          Thanks,<br />The Peer Medical Team
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="background-color:transparent;">
                          <div
                            class="block-grid"
                            style="Margin: 0 auto; min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"
                          >
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"
                            >
                              <div
                                class="col num12"
                                style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="background-color:transparent;">
                          <div
                            class="block-grid"
                            style="Margin: 0 auto; min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"
                          >
                            <div
                              style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"
                            >
                              <div
                                class="col num12"
                                style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top;;"
                              >
                                <div style="width:100% !important;">
                                  <div
                                    style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"
                                  >
                                    <div
                                      style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;"
                                    >
                                      <p
                                        style="font-size: 14px; line-height: 14px; text-align: center; margin: 0;"
                                      >
                                        <span style="font-size: 12px;"
                                          >Copyright © 2019 Peer Medical, All rights
                                          reserved.</span
                                        >
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </body>
            </html>`
        },
        Text: {
          Charset: 'UTF-8',
          Data: `You have new messages at peermedical. Check messages at ${channelUrl}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: '[Peer Medical Notifications] - A fellow verified user sent you a message'
      }
    },
    Source: 'noreply@peermedical.com'
  }
  await ses.sendEmail(params).promise()
}

module.exports = async (req, res) => {
  // TODO: VERIFY SIGNATURE
  debug('Headers %O', req.headers)
  debug('Body %O', req.body)
  const eventType = _.get(req, 'body.category', '')
  try {
    if (eventType === 'group_channel:message_send') {
      const members = _.get(req, 'body.members', [])
      const offlineMembersIds = _.map(_.filter(members, { is_online: false }), 'user_id')
      debug('Offline members %O', offlineMembersIds)
      const offlineUsers = await mongoose.model('User').find({ _id: offlineMembersIds })
      debug('Peermedical offline users %O', offlineUsers)
      if (offlineUsers.length > 0) await sendNotificationEmail(offlineUsers, req.body)
    }
  } catch (error) {
    console.error('Something went wrong when trying to handle sendbird webhook.', error)
  }
  res.sendStatus(200)
}
