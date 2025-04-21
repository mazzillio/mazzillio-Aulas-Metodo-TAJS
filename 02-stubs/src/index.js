import Service from "./service.js";
const data = {
    username:`mattheus-${Date.now()}`,
    password:`123456`
}
const service = new Service({
    filename: "users.ndjson"
});
await service.create(data);
const users = await service.read();
console.log('users',users); 