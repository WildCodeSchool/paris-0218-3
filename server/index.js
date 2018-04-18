const fs = require('fs')
const path = require('path')
const util = require('util')

const express = require('express')


const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const isJSON = str => str.endsWith('.json')

const readDirFileContents = dirPath => readdir(dirPath)
  .then(filenames => {
    const filepaths = filenames
      .filter(isJSON)
      .map(filename => path.join(dirPath, filename))
    const files = filepaths.map(filepath => readFile(filepath, 'utf8'))

    return Promise.all(files)
  })
  .then(filesInJSON => filesInJSON.map(JSON.parse))


const readMockFolder = mockDir =>
  readDirFileContents(path.join(__dirname, '../mocks/', mockDir))

readMockFolder('events').then(console.log, console.error)

const app = express()

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*')
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})


app.use((request, response, next)=> {
if(request.method === 'GET') return next()
  let accumulator = ''

    request.on('data', data => {
    accumulator += data
  })
    request.on('end', () => {
        try {
        request.body = JSON.parse(accumulator)
      next()
   }catch (err){
     next(err)
   }   
  })
})


// Création des routes
app.get('/', (request, response) => {
  response.send('Ok')
})



app.post('/users', (request, response, next)=>{
  const id = Math.random().toString(36).slice(2).padEnd(11, '0')
  const filename = `${id}.JSON`
  const filepath = path.join(__dirname, '../mocks/users', filename)

const content = {
  id: id, 
  firstName: request.body.firstNameUsers,
  lastName: request.body.lastNameUsers,
  pseudo: request.body.username,
  email: request.body.mail,
  schoolName:request.body.schoolist,
  password: request.body.password,
  validePassword: request.body.confirmPassword, 
  CreatedAt: Date.now(),
}

 readFile(filepath, JSON.stringify(content), 'utf8' )
    .then(() => response.json('ok'))
    .catch(next)
})


app.get('/events/category/:category', (request, response, next) => {
  readMockFolder('events')
    .then(events => {
      const selectedEvents = events
        .filter(event => event.category === request.params.category)

      response.json(selectedEvents)
    })
    .catch(next)
})

app.get('/events/:id', (request, response, next) => {
  const filename = `${request.params.id}.JSON`
  const filepath = path.join(__dirname, '../mocks/events', filename)

  // 1 - lit le fichier
  // 2 - response.header définit les bons headers
  // 3 - response.send envoie le résultat

  readFile(filepath)
    .then(buffer => {
      response.header('Content-Type', 'application/json')
      response.send(buffer)
    })
    .catch(next)
})

app.get('/categories', (request, response, next) => {
  readMockFolder('categories')
    .then(categories => response.json(categories))
    .catch(next)
})

app.listen(3248, () => console.log("j'écoute sur le port 3248"))
