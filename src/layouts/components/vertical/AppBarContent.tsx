import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useContext, useEffect, useState } from 'react'
import Icon from 'src/@core/components/icon'
import { Settings } from 'src/@core/context/settingsContext'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import NotificationDropdown, { NotificationsType } from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { formatDistanceToNow, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSocket } from 'src/hooks/useSocket'
import getConfig from 'src/configs/environment'
import { AbilityContext } from '../acl/Can'
import Can from 'src/layouts/components/acl/Can'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

interface Client {
  name: string
  lastName: string
  email: string
  phone: string
}
interface Kin {
  name: string
}
interface Typecomplaints {
  name: string
}
interface data {
  complaints: Typecomplaints
  aggressor?: Kin
  victim?: Kin
  place?: string
  description?: string
  latitude?: string
  longitude?: string
  images?: Array<string>
  picture?: string
  video?: string
  otherComplaints?: string
  otherAggressor?: string
  otherVictim?: string
  status?: string
  createdAt: string
  userId: Client
  _id?: string
}


function getNotificationMeta(dateString: string): string {
  const date = new Date(dateString)

  if (isYesterday(date)) {
    return 'Ayer'
  }

  const diff = formatDistanceToNow(date, { addSuffix: true, locale: es })

  if (diff.includes('menos de 1 minuto')) {
    return 'Justo ahora'
  }

  return diff.replace('alrededor de ', '')
}
const AppBarContent = (props: Props) => {

  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const [notifications, setNotifications] = useState<NotificationsType[]>([])

  const ability = useContext(AbilityContext)

  const { waitingComplaints } = useSocket()

  useEffect(() => {
    const newNotification: NotificationsType[] = waitingComplaints.map((value: data) => {
      return {
        id: `${value._id}`,
        meta: getNotificationMeta(value.createdAt),
        title: `${value.userId?.name || 'Desconocido'} ${value.userId?.lastName || ''}`,
        subtitle: `${value.otherComplaints || value.complaints?.name || 'Denuncia desconocida'}`,
        avatarImg: `${getConfig().backendURI}/images/${value.picture}`,
        avatarAlt: `${value.userId?.name || 'Desc'}`,
      }
    })
    setNotifications(newNotification)
  }, [waitingComplaints])

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon icon='mdi:menu' />
          </IconButton>
        )}
        <ModeToggler settings={settings} saveSettings={saveSettings} />
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <Can I='read' a='recibidos'>
          <NotificationDropdown notifications={notifications} />
        </Can>
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default AppBarContent
