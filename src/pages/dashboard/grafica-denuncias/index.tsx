import { Card, CardContent, CardHeader, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic";
import { useState } from "react";
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const GraficaDenuncias = () => {

    const theme = useTheme();

    const [request, setRequest] = useState<number[]>([]);

    const series = [
        {
            name: 'promedio',
            data: request
        }
    ]
    const options: ApexOptions = {
        chart: {
            parentHeightOffset: 0,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                barHeight: '60%',
                horizontal: true,
                distributed: true,
                startingShape: 'rounded'
            }
        },
        dataLabels: {
            offsetY: 8,
            style: {
                fontWeight: 500,
                fontSize: '0.875rem'
            }
        },
        grid: {
            strokeDashArray: 8,
            borderColor: theme.palette.divider,
            xaxis: {
                lines: { show: true }
            },
            yaxis: {
                lines: { show: false }
            },
            padding: {
                top: -18,
                left: 21,
                right: 33,
                bottom: 10
            }
        },
        colors: [
            hexToRGBA(theme.palette.primary.light, 1),
            hexToRGBA(theme.palette.success.light, 1),
            hexToRGBA(theme.palette.warning.light, 1),
            hexToRGBA(theme.palette.info.light, 1),
            hexToRGBA(theme.palette.error.light, 1),
            hexToRGBA(theme.palette.secondary.light, 1)
        ],
        legend: { show: false },
        states: {
            hover: {
                filter: { type: 'none' }
            },
            active: {
                filter: { type: 'none' }
            }
        },
        xaxis: {
            axisTicks: { show: false },
            axisBorder: { show: false },
            categories: ['uno'],//names
            labels: {
                formatter: val => `${Number(val) / 1000}k`,
                style: {
                    fontSize: '0.875rem',
                    colors: theme.palette.text.disabled
                }
            }
        },
        yaxis: {
            labels: {
                align: theme.direction === 'rtl' ? 'right' : 'left',
                style: {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    colors: theme.palette.text.primary
                }
            }
        }
    }
    return (
        <Card>
            <CardHeader
                title='Denuncias frecuentes diario'
                subheaderTypographyProps={{ sx: { lineHeight: 1.429 } }}
                titleTypographyProps={{ sx: { letterSpacing: '0.15px' } }}
            />
            <CardContent
                sx={{
                    p: '0 !important',
                    '& .apexcharts-canvas .apexcharts-yaxis-label': { fontSize: '0.875rem', fontWeight: 600 },
                    '& .apexcharts-canvas .apexcharts-xaxis-label': { fontSize: '0.875rem', fill: theme.palette.text.disabled },
                    '& .apexcharts-data-labels .apexcharts-datalabel': {
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        fill: theme.palette.common.white
                    }
                }}
            >
                <Chart type='bar' height={200} series={series} options={options} />
            </CardContent>
        </Card>
    )
}

export default GraficaDenuncias