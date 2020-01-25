const nanocurrency = require('nanocurrency')
const axios = require('axios')
const BigNumber = require('bignumber.js')
const express = require('express')

const app = express()
app.listen(process.env.PORT || 5000,  '0.0.0.0')

const nanonode = 'https://nanovault.io/api/node-api'
const representative = 'nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or'

//const ends

async function publish(blockjson) {	

return axios.post(nanonode, {
            action: 'process',
            json_block: 'true',
			block: blockjson
  })
  .then(function (response) {
	console.log(response.data)
	return response.data
  })
  .catch(function (error) {
    console.log(error);
  });

}

async function getrecentblock(account) {	

  return axios.post(nanonode, {
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

  return axios.post(nanonode, {
            account: account,
            action: 'account_info'
  })
  .then(function (response) {
     return response.data.balance
  })
  .catch(function (error) {
    console.log(error);
  });
	
}

async function pendingblock(account) {
 return axios.post(nanonode, {
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
  
async function pendingblockcount(account) {
 return axios.post(nanonode, {
            account: account,
            action: 'pending'
  })
  .then(function (response) {
	  x = response.data.blocks
	  
   return x.length;
  })
  .catch(function (error) {
    console.log(error);
  });
  
  
  }  
   
async function block_info(blockid) {
 return axios.post(nanonode, {
            hashes: [blockid],
			json_block: 'true',
            action: 'blocks_info',
			pending: 'true'
  })
  .then(function (response) {
   return response.data.blocks[blockid].amount;
  })
  .catch(function (error) {
    console.log(error);
  });
  
  
  }

async function fetchpending(seed) {
	
secretKey = nanocurrency.deriveSecretKey(seed, 0)
publicKey = nanocurrency.derivePublicKey(secretKey)
address = nanocurrency.deriveAddress(publicKey)


apendingblockcount = await pendingblockcount(address)


if( apendingblockcount > 0){
peniong = await pendingblock(address)
peniongbal = await block_info(peniong)
previous = await getrecentblock(address)
pow = await nanocurrency.computeWork(previous)
cbal = await account_info(address)


puki = new BigNumber(cbal)
balance = puki.plus(peniongbal) 
balancex = balance.toFixed()

dd = { balance: balancex, link: peniong, previous: previous, representative: representative, work: pow }
xxx = await nanocurrency.createBlock(secretKey, dd);

retr = await publish(xxx.block) 
return retr
}else{
	return '{ "hash" : "no_blocks_left" }';
}


}

async function send(seed,sendto,nano) {
	
 //change this to any account number you like 
secretKey = nanocurrency.deriveSecretKey(seed, 0)
publicKey = nanocurrency.derivePublicKey(secretKey)
address = nanocurrency.deriveAddress(publicKey)


  
previous = await getrecentblock(address)
console.log("LASTBLOCK : " +previous)
pow = await nanocurrency.computeWork(previous)
console.log("POW WORK  : " + pow)
cbal = await account_info(address)
console.log("BALANCE   : " + cbal)

x = new BigNumber('1000000000000000000000000000000')
xx = x.multipliedBy(nano).toFixed()
puki = new BigNumber(cbal)
balance = puki.minus(xx) 

balancex = balance.toFixed()

if(balancex>0){
	
dd = { balance: balancex, link: sendto, previous: previous, representative: representative, work: pow }
xxx = await nanocurrency.createBlock(secretKey, dd)
retr = await publish(xxx.block) 

}else{
	
console.log("NO BALANCE ")	
retr = '{ "hash" : "no_balance" }'

}


return retr
}

// functions ends




// express api
app.get('/', (request, reply) => {
  reply.send('OK')
})


app.get('/balance/:addr', async (request, reply) => {
	
	b = 	await account_info(request.params.addr)
	puki = new BigNumber(b)
	
	b2 = puki.dividedBy(1000000000000000000000000000000) 
 
    reply.send({ balance : b2 })
	
})


app.get('/fetch/:seed', async (request, reply) => {
console.log(new Date())

seed = request.params.seed
bing = await fetchpending(seed)

reply.send(bing)
})

app.get('/send/:seed/:sendto/:amount', async (request, reply) => {
console.log(new Date())

seed = request.params.seed
sendto = request.params.sendto
amount = request.params.amount

bing = await send(seed,sendto,amount)

reply.send(bing)
})