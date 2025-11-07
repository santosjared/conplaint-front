interface GradeType {
    name: string
    _id?: string
}

export type RolType = {
    name: string,
    description: string,
    permissions?: Permission[],
    _id?: string
}

export type PostType = {
    name: string,
    _id?: string
}

export type UserType = {
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    password: string,
    rol: RolType | null
    grade: GradeType | null
    otherGrade?: string
    paternalSurname: string
    maternalSurname: string
    firstName: string
    exp: string
    post: PostType | null
    otherPost?: string
    status?: string
    _id?: string
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

export type SubjectType = {
    name: string
    _id: string
}
export type ActionType = {
    name: string
    _id: string
}
