import { AbilityBuilder, Ability, MongoQuery } from '@casl/ability'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects], MongoQuery> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

interface Permission {
  action: { name: string }[]
  subject: { name: string }
}

const VALID_ACTIONS: Actions[] = ['manage', 'create', 'read', 'update', 'delete']

export const buildAbilityFor = (permissions: Permission[]): AppAbility => {
  const { can, rules } = new AbilityBuilder<Ability<[Actions, Subjects], MongoQuery>>(Ability as any)
  if (permissions.length === 0) can('read', 'acl')
  permissions.forEach(permission => {
    const actions = permission.action
      .map(a => a.name)
      .filter((name): name is Actions => VALID_ACTIONS.includes(name as Actions))

    const subject = permission.subject?.name || 'read'

    actions.forEach(action => {
      can(action, subject)
    })
  })

  return new Ability<[Actions, Subjects], MongoQuery>(rules, {
    detectSubjectType: (object: any) => object.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

// export default defineRulesFor
