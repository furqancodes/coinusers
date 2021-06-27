// eslint-disable-next-line new-cap
const router = require('express').Router()
const axios = require('axios').default

const User = require('../models/user')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')
const config = require('../../config')
const {sendEmail, validateToken} = require('../utils/verify')

// -------------------signUp---------------
router.post('/users/signup', async (req, res) => {
  const {name, email, password, age} = req.body
  console.info('creating new user', email)
  try {
    const user = await User.findOne({email})

    if (user) {
      throw new Error('user already exists')
    } else {
      const response = await axios.post(config.COINCRYPTO_URL + '/wallet')
      const {publicKey} = response.data
      const user = await new User({name, email, password, age, publicKey}).save()
      await sendEmail(user.id, email, name)
      res.status(201).send({user})
    }
  } catch (e) {
    console.error(`post /users/signup ${e} | ${e.stack}`)
    res.status(404).send(e)
  }
})
// --------------------login----------------
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    )
    if (!user.verified) {
      throw new Error('Please verify email')
    }
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (e) {
    console.error(`post /users/login ${e} | ${e.stack}`)
    res.status(400).send({Error: e.message})
  }
})
// -------------------transfer-----------------

router.post('/users/transfer', authenticate, async (req, res) => {
  const {amount, senderEmail, recipientEmail} = req.body
  try {
    const sender = await User.findOne({
      email: senderEmail,
    })
    const recipient = await User.findOne({
      email: recipientEmail,
    })
    const response = await axios.post(config.COINCRYPTO_URL + '/transfer', {
      amount,
      recipient: recipient.publicKey,
      senderPublicKey: sender.publicKey,
    })
    res.send(response.data)
  } catch (e) {
    console.error(`post /users/transfer ${e} | ${e.stack} | ${e.response}`)
    res.status(404).send(e)
  }
})

// ------------------logout------------------
router.post('/users/logout', authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    console.error(`post /users/logout ${e} | ${e.stack}`)
    res.status(500).send(e.message)
  }
})

router.post('/users/logoutAll', authenticate, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    console.error(`post /users/logoutAll ${e} | ${e.stack}`)
    res.status(500).send(e.message)
  }
})
// ----------------------------beneficiary-----------

router.get('/users/beneficiaryList', authenticate, async (req, res) => {
  try {
    res.send(req.user.beneficiaries)
  } catch (e) {
    console.error(`get /users/beneficiaryList ${e} | ${e.stack}`)
    res.status(404).send(e)
  }
})

router.delete('/users/beneficiary/:email', authenticate, async (req, res) => {
  const beneficiary = decodeURIComponent(req.params.email)
  try {
    const removeIndex = req.user.beneficiaries
      .map(function(block) {
        return block.beneficiary
      })
      .indexOf(beneficiary)
    req.user.beneficiaries.splice(removeIndex, 1)
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    console.error(`delete /users/beneficiary/:email' ${e} | ${e.stack}`)
    res.status(404).send(e)
  }
})
// -------------------------admin routes------------------

router.get('/users/all', authenticate, authorize, async (req, res) => {
  try {
    const users = await User.find()
    res.send(users)
  } catch (e) {
    console.error(`get /users/all ${e} | ${e.stack}`)
    res.status(404).send(e.message)
  }
})

router.patch('/users/admin/:userEmail', authenticate, authorize, async (req, res) => {
  const user = await User.findOne({email: req.params.userEmail})
  const updates = Object.keys(req.body)
  const allowedUpdates = ['verified', 'activated']
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }

  try {
    updates.forEach(update => (user[update] = req.body[update]))
    await user.save()
    res.send(user)
  } catch (e) {
    console.error(`patch /users/admin/:userEmail ${e} | ${e.stack}`)
    res.status(400).send(e.message)
  }
})

// --------------------------get Transactions----------
router.get('/users/transactions', authenticate, async (req, res) => {
  try {
    const response = await axios.get(
      config.COINCRYPTO_URL + '/wallet/' + req.user.publicKey,
      {
        params: {publicKey: req.user.publicKey},
      }
    )
    const {transactions} = response.data
    const transactionsList = await Promise.all(
      transactions.map(async (transaction) => {
        const outputMap = []
        for (const property in transaction.outputMap) {
          outputMap.push(property)
        }
        const receiver = await User.findOne({publicKey: outputMap[0]})
        const sender = await User.findOne({publicKey: outputMap[1]})
        const date = new Date(transaction.input.timestamp)
        const type = sender && sender.email === req.user.email ? 'Debit' : 'Credit'
        const dateFull =
          date.getDate() +
          '/' +
          (date.getMonth() + 1) +
          '/' +
          date.getFullYear()
        const time =
          date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        return {
          sender: sender ? sender.email : 'undefined',
          receiver: receiver ? receiver.email : 'undefined',
          amount: transaction.input.sendAmount,
          type,
          date: dateFull,
          time,
        }
      })
    )
    res.send({transactionsList: transactionsList})
  } catch (e) {
    console.error(`get /users/transactions ${e} | ${e.stack} | ${e.response}`)
    res.status(500).send(e)
  }
})

// -------------------------verify users------------------
router.get('/users/verify', async (req, res) => {
  try {
    const id = req.query.id
    console.info(`verifying user ${id}`)
    const token = req.query.token
    const valid = validateToken(id, token)
    if (valid) {
      const user = await User.findOneAndUpdate({_id: id, verified: false}, {verified: true})
      if (user) {
        console.info(`user verified ${id}`)
        return res.json({message: 'account verified'}).send()
      }
    }
    console.error(`user not verified ${id} valid:${valid}`)
    res.status(403).send()
  } catch (e) {
    console.error(`get /users/verify ${e} | ${e.stack} | ${e.response}`)
    res.status(500).send(e)
  }
})

// -------------------------users routes------------------

router.get('/users/me', authenticate, async (req, res) => {
  try {
    const response = await axios.get(
      config.COINCRYPTO_URL + '/wallet/' + req.user.publicKey,
      {
        params: {publicKey: req.user.publicKey},
      }
    )
    res.send({user: req.user, wallet: response.data})
  } catch (e) {
    console.error(`get /users/me ${e} | ${e.stack} | ${e.response}`)
    res.status(500).send(e)
  }
})

router.patch('/users/me', authenticate, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'password', 'age', 'beneficiary']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    updates.forEach((update) => {
      if (update !== 'beneficiary') {
        return (req.user[update] = req.body[update])
      } else if (update === 'beneficiary') {
        return req.user['beneficiaries'].push({
          beneficiary: req.body[update],
        })
      }
    })
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    console.error(`patch /users/me ${e} | ${e.stack} | ${e.response}`)
    res.status(400).send(e)
  }
})

router.delete('/users/me', authenticate, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (e) {
    console.error(`del /users/me ${e} | ${e.stack} | ${e.response}`)
    res.status(500).send(e.message)
  }
})

module.exports = router
