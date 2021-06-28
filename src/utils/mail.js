
const nodeMailjet = require('node-mailjet')
const bcrypt = require('bcryptjs')

const {MJ: {APIKEY_PUBLIC, APIKEY_PRIVATE}, COINUSERS_URL} = require('../../config')
const mailjet = nodeMailjet.connect(APIKEY_PUBLIC, APIKEY_PRIVATE)

const generateToken = async (userId) => {
  return bcrypt.hash(userId, 8)
}

const validateToken = async (userId, token) => {
  return bcrypt.compare(userId, token)
}

const sendVerificationEmail = async (userId, userEmail, userName) => {
  console.info('sending email to', userId, userEmail, userName)
  const token = await generateToken(userId)
  const link = `${COINUSERS_URL}/users/verify?id=${userId}&token=${token}`
  const request = mailjet
    .post('send', {'version': 'v3.1'})
    .request({
      'Messages': [
        {
          'From': {
            'Email': 'furqanashraf.me@gmail.com',
            'Name': 'Coinchain',
          },
          'To': [
            {
              'Email': userEmail,
              'Name': userName,
            },
          ],
          'Subject': 'Welcome to Coinchain',
          // eslint-disable-next-line max-len
          'HTMLPart': `
            <p>Hi ${userName},<br>
            <br>
            Please click the link to verify your account.<br>
            <a href='${link}'>${link}</a><br>
            <br>
            <br>
            Thanks,
            </p>
            `,
        },
      ],
    })
  request
    .then((result) => {
      console.log(`email sent to user ${userEmail} | ${result.response.status}`)
    })
    .catch((err) => {
      console.log(`error sending email to user ${userEmail} | ${err} | ${err.statusCode}`)
      throw err
    })
}

const sendTransactionEmail = async (userEmail, userName, participant, type, amount) => {
  const request = mailjet
    .post('send', {'version': 'v3.1'})
    .request({
      'Messages': [
        {
          'From': {
            'Email': 'furqanashraf.me@gmail.com',
            'Name': 'Coinchain',
          },
          'To': [
            {
              'Email': userEmail,
              'Name': userName,
            },
          ],
          'Subject': 'Coinchain Transaction',
          // eslint-disable-next-line max-len
          'HTMLPart': `
            <p>Hi ${userName},<br>
            <br>
            You have ${type} amount ${amount}/- ${type === 'sent' ? 'to' : 'from'} user ${participant}.<br>
            <br>
            <br>
            Thanks,
            </p>
            `,
        },
      ],
    })
  request
    .then((result) => {
      console.log(`email sent to user ${userEmail} | ${result.response.status}`)
    })
    .catch((err) => {
      console.log(`error sending email to user ${userEmail} | ${err} | ${err.statusCode}`)
      throw err
    })
}

module.exports = {
  sendTransactionEmail,
  sendVerificationEmail,
  validateToken,
}
