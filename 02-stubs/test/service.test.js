import { beforeEach, describe, it, jest ,expect } from '@jest/globals'
import Service from '../src/service.js'
import fsPromises from 'node:fs/promises'
import crypto  from 'node:crypto'
/*jest.mock('fs',()=>({
    existsSync:jest.fn()
    }))*/
   import fs from 'node:fs'
   
   describe('service Test Suite', () => {
       let _service;
       const filename = "testfile.ndjson"
       const hashedPassword = 'hashedPassword'
       const expectedCreatedAt = new Date().toISOString()
       beforeEach(() => {
           _service = new Service({ filename })
        })

    describe('#read', () => {
        it('should return an empty array', async () => {
            jest.spyOn(fsPromises, fsPromises.readFile.name).mockResolvedValue('')
            const users = await _service.read()
           
            expect(users).toEqual([])
        })

        it('should return an array of users', async () => {
            const data = [{
                username: 'mattheus',
                password: '123456',
                createdAt: new Date().toISOString()
            },
            {
                username: 'mattheus2',
                password: '1234562',
                createdAt: new Date().toISOString()
            }
        ]
        const fileContents = data.map(item=>JSON.stringify(item).concat('\n')).join('') 
            jest.spyOn(fsPromises, "readFile").mockResolvedValue(fileContents)
            const users = await _service.read()
            const expected = data.map(({password,...rest})=>rest)
            expect(users).toEqual(expected)
        })
    })

    describe("#create", () => { 
        beforeEach(()=>{
            jest.spyOn(crypto, crypto.createHash.name).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(hashedPassword)
            })
            jest.spyOn(fsPromises, fsPromises.appendFile.name).mockResolvedValue()
        })
        it('should create a user', async () => {
            const data = {
                username: 'mattheus',
                password: '123456'
            }
            jest.spyOn(Date.prototype, Date.prototype.toISOString.name).mockReturnValue(expectedCreatedAt)
            
            await _service.create(data)
            expect(crypto.createHash).toHaveBeenCalledWith('sha256')
            const hash = crypto.createHash('sha256')
            expect(hash.update).toHaveBeenCalledWith(data.password)
            expect(hash.digest).toHaveBeenCalledWith('hex')
            const expectedData = JSON.stringify({
                ...data,
                password: hashedPassword,
                createdAt: expectedCreatedAt
            }).concat('\n')
            expect(fsPromises.appendFile).toHaveBeenCalledWith(filename, expectedData)
            expect(fsPromises.appendFile).toHaveBeenCalledTimes(1)
        })
    })
})