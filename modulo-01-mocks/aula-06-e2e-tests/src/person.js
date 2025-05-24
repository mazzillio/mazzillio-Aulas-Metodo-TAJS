class Person {
    static validate(person) {
        if(!person.name) throw new Error('name is required')
        if(!person.cpf) throw new Error('cpf is required')
    }
    static format(person) {
        const [name, ...lastName] = person.name.split(' ')
        return {
            cpf: person.cpf.replace(/\D/g, ''),
            name,
            lastName: lastName.join(' ')
        }
    }
    static save(person) {
        if(!['cpf', 'name', 'lastName'].every(prop => person[prop])) {
            throw new Error(`cannot save invalid person: ${JSON.stringify(person)}`)
        }

        // .. banco de dados, api, etc

        console.log('registrado com sucesso!!', person)
    }

    static process(person) {
        this.validate(person)
        const personFormatted = this.format(person)
        this.save(personFormatted)

        return 'ok'
    }
}

// Person.process({
//     // name: 'Zezin da Silva',
//     cpf: '123.456.789-00'
//  })

export default Person