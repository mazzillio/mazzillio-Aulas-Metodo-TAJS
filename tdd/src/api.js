import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';

const usersDb = []

function getUserCategory(birthDate){
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
    if(isNaN(age)){
        throw new Error()
    }
    if(age >= 18 && age <= 25){
        return 'young-adult'
    }
    if(age >= 26 && age <= 50){
        return 'adult'
    }
    if(age >= 51){
        return 'senior'
    }
    if(age < 18){
        throw new Error('User must be adult')
    }
}

const server = createServer(async (req, res) => {
    try{
        if(req.url === '/users' && req.method === 'POST'){
            const user = JSON.parse(await once(req, 'data'))
            if(!user.name){
                throw new Error('Name is required')
            }
            if(!user.birthDate){
                throw new Error('Birth date is required')
            }
            const createdUser = {
                id: randomUUID(),
                ...user,
                category: getUserCategory(user.birthDate)
            }
            usersDb.push(createdUser)
            res.writeHead(201, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                id: createdUser.id,
            }))
            return;
        }
        if(req.url.startsWith('/users') && req.method === 'GET'){
        const [, , id] = req.url.split('/')
        const user = usersDb.find(user => user.id === id)
        if(!user){
           throw new Error('User not found')
        }
        res.end(JSON.stringify(user))
        return;
        }
    }catch(error){
        const errors = ['Name is required', 'Birth date is required', 'User must be adult']
        if(errors.includes(error.message)){
            res.writeHead(400,{
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                error: error.message
            }))
            return;
        }
        if(error.message === 'User not found'){
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                error: error.message
            }))
            return;
        }
        res.writeHead(500, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            error: 'Internal server error'
        }))
    }
    
})

export { server }