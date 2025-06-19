// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      subject: 'dashboard',
      action: 'read',
      icon: 'mdi:home-outline',
    },
    {
      title: 'Registro de usuarios',
      path: '/users',
      subject: 'users',
      action: 'read',
      icon: 'mdi:users',
    },
    {
      title: 'Roles y permisos',
      path: '/roles',
      subject: 'roles',
      action: 'read',
      icon: 'mdi:account-key',
    },
    {
      title: 'Registro de denuncias',
      path: '/complaints',
      subject: 'complaints',
      action: 'read',
      icon: 'mdi:notebook-edit-outline',
    },
    {
      title: 'Denuncias recibidos',
      path: '/received',
      subject: 'received',
      action: 'read',
      icon: 'mdi:calendar-check',
    },
    {
      title: 'Denucnias asignadas',
      path: '/assigned',
      subject: 'assigned',
      action: 'read',
      icon: 'mdi:account-arrow-left',
    },
  ]
}

export default navigation
