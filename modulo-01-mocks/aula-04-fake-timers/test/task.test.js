import { it, expect, describe, beforeEach,jest } from '@jest/globals'
import Task from '../src/task'
import{ setTimeout } from 'node:timers/promises'
import { on } from 'node:events';

describe('Task Suite', () => {
    let _logMock;
    let _task
    const oneSecon = 1000
    beforeEach(() => {
        _logMock = jest.spyOn(console, console.log.name).mockImplementation();
        _task = new Task();
    })
    it.skip('should only run tasks that are due without fakeTimers SLOW', async () => {
        const tasks = [
            { 
                name:'taksWillRunIn5Seconds',
                dueAt:new Date(Date.now() + oneSecon * 3),
                fn:jest.fn()
            },
            {
                name:'taksWillRunIn10Seconds',
                dueAt:new Date(Date.now() + oneSecon * 6),
                fn:jest.fn()
            },
        ]
        _task.save(tasks.at(0))
        _task.save(tasks.at(1))

        _task.run(200)
        await setTimeout(8* oneSecon)

        expect(tasks.at(0).fn).toHaveBeenCalled()
        expect(tasks.at(1).fn).toHaveBeenCalled()

    }, oneSecon * 10)
    it('should only run tasks that are due with fakeTimers FAST', async () => {
        jest.useFakeTimers()
        const tasks = [
            { 
                name:'taksWillRunIn5Seconds',
                dueAt:new Date(Date.now() + oneSecon * 5),
                fn:jest.fn()
            },
            {
                name:'taksWillRunIn10Seconds',
                dueAt:new Date(Date.now() + oneSecon * 10),
                fn:jest.fn()
            },
        ]
        _task.save(tasks.at(0))
        _task.save(tasks.at(1))

        _task.run(200)
        jest.advanceTimersByTime(4 * oneSecon)


        expect(tasks.at(0).fn).not.toHaveBeenCalled()
        expect(tasks.at(1).fn).not.toHaveBeenCalled()

        jest.advanceTimersByTime(oneSecon*2)
        expect(tasks.at(0).fn).toHaveBeenCalled()
        expect(tasks.at(1).fn).not.toHaveBeenCalled()

        jest.advanceTimersByTime(oneSecon*4)
        expect(tasks.at(0).fn).toHaveBeenCalled()
        expect(tasks.at(1).fn).toHaveBeenCalled()

        jest.useRealTimers()

    })
})