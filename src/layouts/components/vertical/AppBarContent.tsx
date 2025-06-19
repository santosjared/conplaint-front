// ** MUI Imports
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useEffect, useState } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'


// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'
import Swal from 'sweetalert2';

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import NotificationDropdown, { NotificationsType } from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { io } from 'socket.io-client'
import environment from 'src/configs/environment'
import { instance } from 'src/configs/axios'
import { formatDistanceToNow, format, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

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
  video?: string
  otherComplaints?: string
  otherAggressor?: string
  otherVictim?: string
  status?: string
  createdAt: string
  userId: Client
  _id?: string
}

const socket = io(environment().backendURI);

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
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const [notifications, setNotifications] = useState<NotificationsType[]>([])

  const data = async () => {
    try {
      const response = await instance.get('/complaints-client/complaints-with-status', { params: { status: 'waiting' } });
      const newNotification: NotificationsType[] = response.data.data.map((value: data) => {
        return {
          meta: getNotificationMeta(value.createdAt),
          title: `${value.userId.name} ${value.userId.lastName}`,
          subtitle: value.complaints && value.complaints.name !== 'Otro' ? value.complaints.name : value.otherComplaints,
          avatarText: value.userId.name[0] + value.userId.lastName[0],
          avatarColor: 'info'
        }
      })
      setNotifications(newNotification)
    } catch (e) {
      console.log(e);
      Swal.fire({
        title: '¡Error!',
        text: 'Estamos teniendo problemas al solicitar datos. Por favor contacte al desarrollador del sistema para más asistencia.',
        icon: "error"
      });
      return []
    }
  }
  useEffect(() => {
    data();
  }, [])

  socket.on('notification', (data) => {
    data();
  })

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
        <NotificationDropdown settings={settings} notifications={notifications} />
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
