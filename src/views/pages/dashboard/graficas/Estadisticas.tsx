import { Card, CardContent, CardHeader, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { useSocket } from "src/hooks/useSocket";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const GraficaDenuncias = () => {
    const theme = useTheme();

    const { denuncias } = useSocket()

    const series = [
        {
            name: "realizadas",
            data: denuncias.map(item => item.total)
        }
    ];

    const options: ApexOptions = {
        chart: { parentHeightOffset: 0, toolbar: { show: false } },
        plotOptions: {
            bar: {
                borderRadius: 8,
                barHeight: "60%",
                horizontal: false,
                distributed: true,
                startingShape: "rounded"
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontWeight: 500,
                fontSize: "0.875rem"
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
        xaxis: {
            categories: denuncias.map(item => item.name),
            labels: {
                rotate: -45,
                style: {
                    fontSize: "0.875rem",
                    colors: theme.palette.text.disabled
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    colors: theme.palette.text.primary
                }
            }
        },
        grid: {
            borderColor: theme.palette.divider
        },
        legend: { show: false }
    };

    return (
        <Card>
            <CardHeader
                title="Frecuencia de denuncias recibidas"
                subheaderTypographyProps={{ sx: { lineHeight: 1.429 } }}
                titleTypographyProps={{ sx: { letterSpacing: "0.15px" } }}
            />
            <CardContent>
                <Chart type="bar" height={250} series={series} options={options} />
            </CardContent>
        </Card>
    );
};

export default GraficaDenuncias;
