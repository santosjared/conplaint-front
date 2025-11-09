import { createContext } from 'react'
import { AnyAbility } from '@casl/ability'
import { createContextualCan } from '@casl/react'
import { Actions, Subjects } from 'src/context/types';

export const AbilityContext = createContext<AnyAbility>(undefined!)

export default createContextualCan(AbilityContext.Consumer) as <
    I extends Actions = Actions,
    A extends Subjects = Subjects
>(props: { I: I; a: A; children: React.ReactNode }) => JSX.Element | null;
