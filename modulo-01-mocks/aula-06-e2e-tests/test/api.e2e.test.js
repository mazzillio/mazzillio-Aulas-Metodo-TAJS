import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals'
function waitForServerStatus(server) {
    return new Promise((resolve, reject) => {
        server.once('error', (err) => reject(err))
        server.once('listening', () => resolve())
        
    })
}
describe(' E2E tests suite', () => {

    describe('E2E Tests for Sever in a non-test env',()=>{
        it('should start server with port 4000', async()=>{
            const port = 4000
            process.env.NODE_ENV = 'production'
            process.env.PORT = port
            jest.spyOn(console, 'log')
            const { default:server } = await import('../src/index.js')
            await waitForServerStatus(server)
            const serverInfo = server.address()
            expect(serverInfo.port).toBe(port)
            expect(console.log).toHaveBeenCalledWith(`server is running at ${serverInfo.address}:${serverInfo.port}`)
            return new Promise(resolve => server.close(resolve))
           
        })
    })
    describe('E2E tests for SERVER', () => {
        // fazer o caminho que vai passar
        let _testServer
        let _testServerAddress
     beforeAll(async () => {
        //init setup
        process.env.NODE_ENV = 'test'
        const { default:server } = await import('../src/index.js')
        _testServer = server.listen()
        await waitForServerStatus(_testServer)
        const serverInfo  = _testServer.address()
        _testServerAddress = `http://localhost:${serverInfo.port}`
        //end setup

     })
     afterAll(done => {_testServer.close(done)})
     it('should return 404 for unsuported routes', async () => {
        const response = await fetch(`${_testServerAddress}/unsuported-route`)
        expect(response.status).toBe(404)
     })
     it('should return 400 and missing file message when body is invalid', async () => {
        const invalidBody = { name: 'Fullano da silva'}
        const response = await fetch(`${_testServerAddress}/persons`, {
            method: 'POST',
            body: JSON.stringify(invalidBody),
        })
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.validationError).toEqual('cpf is required')
       
     })
     it('should return 400 and missing file message when body is invalid', async () => {
        const invalidBody = { cpf:'12345678901'}
        const response = await fetch(`${_testServerAddress}/persons`, {
            method: 'POST',
            body: JSON.stringify(invalidBody),
        })
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.validationError).toEqual('name is required')
       
     })
     it('should return 500 and missing file message when body is invalid', async () => {
        const invalidBody = { name:'joe',cpf:'12345678901'}
        jest.spyOn(console, 'error')
        const response = await fetch(`${_testServerAddress}/persons`, {
            method: 'POST',
            body: JSON.stringify(invalidBody),
        })
        expect(console.error).toHaveBeenCalledWith("deu ruim: ","cannot save invalid person: {\"cpf\":\"12345678901\",\"name\":\"joe\",\"lastName\":\"\"}") 
        expect(response.status).toBe(500)
       
     })
     it('should return 200 and success message when body is valid', async () => {
        const validBody = { name:'joe doe',cpf:'12345678901'}
        jest.spyOn(console, 'log')
        const response = await fetch(`${_testServerAddress}/persons`, {
            method: 'POST',
            body: JSON.stringify(validBody),
        })
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(console.log).toHaveBeenCalledWith('registrado com sucesso!!', {
            name:'joe',
            lastName:'doe',
            cpf:'12345678901'
        })
        expect(data).toEqual({result:'ok'})
     })
    })
})