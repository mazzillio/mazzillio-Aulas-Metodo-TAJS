import { describe, it, expect, beforeAll, afterAll,jest } from '@jest/globals'
import { server } from '../src/api.js'

/*
    Deve cadastrar usuarios e definir uma categoria onde:
    - Jovens Dultos:
        - 18 a 25 anos
    - Adultos:
        - 26 a 50 anos
    - Idosos:
        - 51 anos ou mais
    - Menores de 18 anos:
        - Error
*/
describe('API USERS E2E Suite', () => {
    let _testServer
    let _testServerAddress
    function waitForServerStatus(server) {
        return new Promise((resolve, reject) => {
            server.once('error', (err) => reject(err))
            server.once('listening', () => resolve())
            
        })
    }
    function createUser(data){
        return fetch(`${_testServerAddress}/users`,{
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    function fetchUser(id){
        return fetch(`${_testServerAddress}/users/${id}`)
    }
    async function findUserById(id){
        const response = await fetchUser(id)
        return response.json()
    }
     beforeAll(async () => {
        //init setup
        
        _testServer = server.listen()
        await waitForServerStatus(_testServer)
        const serverInfo  = _testServer.address()
        _testServerAddress = `http://localhost:${serverInfo.port}`
        jest.useFakeTimers({
            now: new Date('2025-01-01T00:00')
        })
        //end setup

     })
     afterAll(done => {
        server.closeAllConnections()
        _testServer.close(done)
    })
    it('should be return error when name is not provided', async()=>{
        const response = await createUser({
            birthDate: '2005-01-01'
        })
        expect(response.status).toBe(400)
        const result = await response.json()
        expect(result.error).toBe('Name is required')
    })
    it('should be return error when birth date is not provided', async()=>{
        const response = await createUser({
            name: 'John Doe'
        })
        expect(response.status).toBe(400)
        const result = await response.json()    
        expect(result.error).toBe('Birth date is required')
    })
    it('should register a new user with young-adult category',async ()=>{
        const expectedCategory = 'young-adult'
        const response = await createUser({
            name: 'John Doe',
            birthDate: '2005-01-01'
        })
       expect(response.status).toBe(201)
       const result = await response.json()
       expect(result.id).not.toBeUndefined()
       const user = await findUserById(result.id)
       expect(user.category).toStrictEqual(expectedCategory)
    });
    it('should register a new user with adult category', async()=>{
        const expectedCategory = 'adult'
        const response = await createUser({
            name: 'John Doe',
            birthDate: '1995-01-01'
        })
        expect(response.status).toBe(201)
        const result = await response.json()
        expect(result.id).not.toBeUndefined()
        const user = await findUserById(result.id)
        expect(user.category).toStrictEqual(expectedCategory)
    });
    it('should register a new user with senior category', async()=>{
        const expectedCategory = 'senior'
        const response = await createUser({
            name: 'John Doe',
            birthDate: '1960-01-01'
        })
        expect(response.status).toBe(201)
        const result = await response.json()
        expect(result.id).not.toBeUndefined()
        const user = await findUserById(result.id)
        expect(user.category).toStrictEqual(expectedCategory)
    });
    it('should not register and throw error for new user with minor category', async()=>{
        const response = await createUser({
            name: 'John Doe',
            birthDate: '2010-01-01'
        })
        expect(response.status).toBe(400)
        const result = await response.json()
        expect(result.error).toBe('User must be adult')
    });
    it('should be return not found user', async()=>{
        const response = await fetchUser('123')
        expect(response.status).toBe(404)
        const result = await response.json()
        expect(result.error).toBe('User not found')
    });
    it('should be return internal server error', async()=>{
        const user = {
            name: 'John Doe',
            birthDate: 'invalid-date'
        }
         const response = await createUser(user)
        expect(response.status).toBe(500)
        const result = await response.json()
        expect(result.error).toBe('Internal server error')
    })

})