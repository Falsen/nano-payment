const nanocurrency = require('nanocurrency')
const axios = require('axios')
const BigNumber = require('bignumber.js')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 5000



async function publish(blockjson) {	
console.log("publish called ")

return axios.post('https://nanovault.io/api/node-api', {
            action: 'process',
            json_block: 'true',
			block: blockjson
  })
  .then(function (response) {
    console.log(response.data);
	return response.data
  })
  .catch(function (error) {
    console.log(error);
  });

}

async function getrecentblock(account) {	
console.log("getrecentblock called ")
	
  return axios.post('https://nanovault.io/api/node-api', {
            account: account,
            action: 'account_info',
  })
  .then(function (response) {
   return response.data.frontier
  })
  .catch(function (error) {
    console.log(error);
  });
  
}

async function account_info(account) {	
console.log("account_info called ")
	
  return axios.post('https://nanovault.io/api/node-api', {
            account: account,
            action: 'account_info'
  })
  .then(function (response) {
   console.log(response.data.balance)
     return response.data.balance
  })
  .catch(function (error) {
    console.log(error);
  });
	
}

async function pendingblock(account) {
 return axios.post('https://nanovault.io/api/node-api', {
            account: account,
            action: 'pending'
  })
  .then(function (response) {
   return response.data.blocks[0];
  })
  .catch(function (error) {
    console.log(error);
  });
  
  
  }

async function send(seed,sendto,nano) {
	
 //change this to any account number you like 
  const secretKey = nanocurrency.deriveSecretKey(seed, 0)
  const publicKey = nanocurrency.derivePublicKey(secretKey)
  const address = nanocurrency.deriveAddress(publicKey)
  const representative = 'nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd'

  
const previous = await getrecentblock(address)
console.log("LAST BLOCK : " +previous)
const pow = await nanocurrency.computeWork(previous)
console.log("WORK : " + pow)
const cbal = await account_info(address)
console.log("BALANCE : " + cbal)

x = new BigNumber('1000000000000000000000000000000')
xx = x.multipliedBy(nano).toFixed()
console.log('xx ' +xx)

puki = new BigNumber(cbal)
balance = puki.minus(xx) 
console.log(balance.toFixed())

balancex = balance.toFixed()

dd = { balance: balancex, link: sendto, previous: previous, representative: representative, work: pow }
xxx = await nanocurrency.createBlock(secretKey, dd);
console.log(xxx)

retr = await publish(xxx.block) 

return retr
}




app.get('/', (request, reply) => {
  reply.send('OK')
})

app.get('/send/:seed/:sendto/:amount', async (request, reply) => {

  seed = request.params.seed
    sendto = request.params.sendto
	  amount = request.params.amount

  bing = await send(seed,sendto,amount)

  reply.send(bing)
})


app.listen(PORT,  '0.0.0.0')