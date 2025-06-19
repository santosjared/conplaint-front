
export type UserType = {
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    password: string,
    rol: string
    grade: string
    paternalSurname: string
    maternalSurname: string
    firstName: string
    exp: string
    customPost?: string
    post: string
    _id?: string
    __v?: string
}

interface Permission {
    _id: string
    subject: {
        _id: string
        name: string
    }
    action: {
        _id: string
        name: string
    }[]
}
export type RolType = {
    name: string,
    description: string,
    permissions?: Permission[],
    _id?: string
    __v?: string
}

export type SubjectType = {
    name: string
    _id: string
}
export type ActionType = {
    name: string
    _id: string
}
