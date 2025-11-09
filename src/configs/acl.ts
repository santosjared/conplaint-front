import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'
import { Actions, Permission } from 'src/context/types'

export type Subjects = string

export type ACLObj = {
  action: Actions
  subject: string
}

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export const buildAbilityFor = (permission: Permission[]): AppAbility => {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permission.forEach((permission) => {
    permission.action.forEach((action) => {
      can(action, permission.subject);
    });
  });

  can('read', 'acl');

  return createMongoAbility(rules);
};

