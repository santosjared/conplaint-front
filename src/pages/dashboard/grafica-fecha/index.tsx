import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

import OptionsMenu from 'src/@core/components/option-menu'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CrmMonthlyBudget = () => {
    const theme = useTheme()

    const options: ApexOptions = {
        chart: {
            offsetY: -8,
            parentHeightOffset: 0,
            toolbar: { show: false }
        },
        tooltip: { enabled: false },
        dataLabels: { enabled: false },
        stroke: {
            width: 5,
            curve: 'smooth'
        },
        grid: {
            show: false,
            padding: {
                left: 10,
                top: -24,
                right: 12
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityTo: 0.7,
                opacityFrom: 0.5,
                shadeIntensity: 1,
                stops: [0, 90, 100],
                colorStops: [
                    [
                        {
                            offset: 0,
                            opacity: 0.6,
                            color: theme.palette.success.main
                        },
                        {
                            offset: 100,
                            opacity: 0.1,
                            color: theme.palette.background.paper
                        }
                    ]
                ]
            }
        },
        theme: {
            monochrome: {
                enabled: true,
                shadeTo: 'light',
                shadeIntensity: 1,
                color: theme.palette.success.main
            }
        },
        xaxis: {
            type: 'numeric',
            labels: { show: false },
            axisTicks: { show: false },
            axisBorder: { show: false }
        },
        yaxis: { show: false },
        markers: {
            size: 1,
            offsetY: 1,
            offsetX: -5,
            strokeWidth: 4,
            strokeOpacity: 1,
            colors: ['transparent'],
            strokeColors: 'transparent',
            discrete: [
                {
                    size: 7,
                    seriesIndex: 0,
                    dataPointIndex: 7,
                    strokeColor: theme.palette.success.main,
                    fillColor: theme.palette.background.paper
                }
            ]
        }
    }

    return (
        <Card>
            <CardHeader
                title='Denuncias frecuentes de la fecha hasta la fecha'
                action={
                    <OptionsMenu
                        options={['Refresh', 'Edit', 'Update']}
                        iconButtonProps={{ size: 'small', className: 'card-more-options' }}
                    />
                }
            />
            <CardContent>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Chart
                            type='area'
                            height={245}
                            options={options}
                            series={[
                                { name: 'Traffic Rate', data: [0, 85, 25, 125, 90, 250, 200, 350] },
                                { name: 'Traffic Rate', data: [0, 85, 25, 125, 90, 250, 200, 350] }
                            ]}
                        />
                        <Typography variant='body2' sx={{ mt: 2 }}>
                            Last month you had $2.42 expense transactions, 12 savings entries and 4 bills.
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default CrmMonthlyBudget
