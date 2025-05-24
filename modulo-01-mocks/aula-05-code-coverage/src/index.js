import Task from "./task.js";

const oneSecon = 1000
const runInSecond = new Date(Date.now() + oneSecon)
const runInSecond2 = new Date(Date.now() + oneSecon * 2)
const runInSecond3 = new Date(Date.now() + oneSecon * 3)

const task = new Task();

task.save({
    name: 'task1',
    dueAt: runInSecond,
    fn: () => console.log('task1')
})
task.save({
    name: 'task2',
    dueAt: runInSecond2,
    fn: () => console.log('task2')
})
task.save({
    name: 'task3',
    dueAt: runInSecond3,
    fn: () => console.log('task3')
})

task.run(oneSecon)
