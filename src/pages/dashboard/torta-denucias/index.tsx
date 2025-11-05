import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { useSocket } from 'src/hooks/useSocket'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const CrmTotalGrowth = () => {

    const { total_denuncias } = useSocket()

    const filteredData = total_denuncias.filter(d => d.name !== 'recibidos')
    const totalRecibidos = total_denuncias.find(d => d.name === 'recibidos')?.total || 0
    const series = filteredData.map(d => d.total)
    const labels = filteredData.map(d => d.name)

    const theme = useTheme()

    const options: ApexOptions = {
        legend: { show: true },
        stroke: { width: 5, colors: [theme.palette.background.paper] },
        colors: [
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
        ],
        labels,
        tooltip: {
            y: { formatter: (val: number) => `${val}%` },
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
                                typeof val === 'string' ? `${val}%` : `${totalRecibidos}`,
                        },
                        value: {
                            offsetY: 6,
                            fontWeight: 600,
                            fontSize: '1rem',
                            formatter: (val) => `${val}%`,
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

                {/* Gráfica */}
                <Chart
                    type="donut"
                    height={135}
                    options={options}
                    series={series}
                />
            </CardContent>
        </Card>
    )
}

export default CrmTotalGrowth
