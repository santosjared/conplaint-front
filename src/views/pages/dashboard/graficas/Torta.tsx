import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { useSocket } from 'src/hooks/useSocket'
import { Avatar } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import { styled, Theme } from '@mui/material/styles'
import CustomChip from 'src/@core/components/mui/chip'
import getConfig from 'src/configs/environment'
import { ReactNode } from 'react'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const MenuItemTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
    fontWeight: 600,
    flex: '1 1 100%',
    overflow: 'hidden',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginBottom: theme.spacing(0.75)
}))

const MenuItemSubtitle = styled(Typography)<TypographyProps>({
    flex: '1 1 100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
})

const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '&:not(:last-of-type)': {
        borderBottom: `1px solid ${theme.palette.divider}`
    }
}))

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
    maxHeight: 244
})

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
    if (hidden) {
        return <Box sx={{ maxHeight: 349, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
        return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
    }
}

const CrmTotalGrowth = () => {

    const { total_denuncias, allComplaints } = useSocket()

    const filteredData = total_denuncias.filter(d => d.name !== 'Recibidos')
    const totalRecibidos = total_denuncias.find(d => d.name === 'Recibidos')?.total || 0
    const series = filteredData.map(d => d.total)
    const labels = filteredData.map(d => d.name)

    const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

    const theme = useTheme()

    const options: ApexOptions = {
        legend: {
            show: true,
            labels: {
                colors: theme.palette.text.secondary
            }
        },
        stroke: { width: 5, colors: [theme.palette.background.paper] },
        colors: [
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.success.main,
        ],
        labels,
        tooltip: {
            y: { formatter: (val: number) => `${val}` },
        },
        dataLabels: { enabled: false },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '50%',
                    labels: {
                        show: true,
                        name: { show: false },
                        total: {
                            label: '',
                            show: true,
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: theme.palette.text.secondary,
                            formatter: (val) =>
                                typeof val === 'string' ? `${val}` : `${totalRecibidos}`,
                        },
                        value: {
                            offsetY: 6,
                            fontWeight: 600,
                            fontSize: '1rem',
                            formatter: (val) => `${val}`,
                            color: theme.palette.text.secondary,
                        },
                    },
                },
            },
        },
    }

    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: (theme) => theme.palette.info.main,
                            }}
                        />
                        <Typography variant="body2">
                            <strong>Total de denuncias recibidas</strong>
                        </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 1 }}>
                        {totalRecibidos}
                    </Typography>
                </Box>
                <Chart
                    type="donut"
                    height={135}
                    options={options}
                    series={series}
                />
            </CardContent>
            <ScrollWrapper hidden={hidden}>
                {allComplaints.map((value, index) => (
                    <MenuItem
                        key={index}
                        disableRipple
                        disableTouchRipple
                        sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
                    >
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                            <Avatar alt={`${value.userId?.name || 'Desc'}`} src={`${getConfig().backendURI}/images/${value.userId?.picture}`} />
                            <Box sx={{ mx: 4, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                                <MenuItemTitle>{`${value.userId?.name || 'Desconocido'} ${value.userId?.lastName || ''}`}</MenuItemTitle>
                                <MenuItemSubtitle variant='body2'>{`${value.otherComplaints || value.complaints?.name || 'Denuncia desconocida'}`}</MenuItemSubtitle>
                            </Box>
                            <CustomChip
                                skin='light'
                                size='small'
                                label={value.status === 'waiting' ? 'En espera' : value.status === 'acepted' ? 'Atendida' : 'Rechazada'}
                                color={value.status === 'waiting' ? 'warning' : value.status === 'acepted' ? 'success' : 'error'}
                                sx={{ textTransform: 'capitalize' }}
                            />
                        </Box>
                    </MenuItem>
                ))}
            </ScrollWrapper>
        </Card>
    )
}

export default CrmTotalGrowth
