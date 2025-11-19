// ** React Imports
import { ReactNode } from 'react'

interface DirectionProps {
  children: ReactNode
}

const Direction = (props: DirectionProps) => {
  const { children } = props

  return <>{children}</>
}

export default Direction
