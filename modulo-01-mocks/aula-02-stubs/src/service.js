import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'


export default class Service{
    #filename
    constructor({filename}){
        this.#filename = filename
    }
    #hashPassword(password){
        return crypto.createHash('sha256')
        .update(password)
        .digest('hex')
    }
    create({ username, password }){

        const data = JSON.stringify({
            username,
            password: this.#hashPassword(password),
            createdAt: new Date().toISOString()
        }).concat('\n')
        return fs.appendFile(this.#filename, data)
    }
    async read(){
        /*const existsFile = existsSync(this.#filename)
        if(!existsFile) return []
        */
        
        const lines = (await fs.readFile(this.#filename,'utf-8')).split('\n') 
        .filter(Boolean)
        if(!lines.length) return []
        return lines.map(JSON.parse).map(({ password,...rest })=>rest)
    }
}