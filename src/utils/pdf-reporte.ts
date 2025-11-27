import { jsPDF } from "jspdf";
import { UserType } from "src/types/types";
import autoTable, { HAlignType, VAlignType } from "jspdf-autotable";
import { CellInput } from "jspdf-autotable";
import { format } from "date-fns";

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: {
            finalY: number;
            [key: string]: number;
        };
    }
}

interface ComplaintsType {
    name: string
}

interface complaintType {
    createdAt: string
    complaints: ComplaintsType
}

interface DenunciaGenaralType {
    complaint: complaintType
    description: string
}

interface Turno {
    turno: string;
    desde: string;
    hasta: string;
    denuncias: Record<string, number>;
    denuncias_general: DenunciaGenaralType[]
    positivos: number;
    negativos: number;
    total: number;
}

type TextSpan = {
    text: string
    font?: string
    style?: string
    textColor?: [number, number, number]
    bgColor?: [number, number, number]
}

const today = new Date().toISOString().split('T')[0];

export const PDFReporte = (turnos: Turno[], despachadores: UserType[], sub: UserType, date: string) => {
    const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });


    const cmToPt = (cm: number): number => cm * 28.35;
    const marginTop = cmToPt(2.5);
    const marginBottom = cmToPt(2.5);
    const marginLeft = cmToPt(3);
    const marginRight = cmToPt(2.5);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginLeft - marginRight;

    const fontSize = 8;
    const lineHeight = fontSize * 1.15;

    const addText = (text: string, x = marginLeft, size = 11, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.text(text, x, y);
    };

    const safe = (txt?: string) => txt || "";
    const fullName = (u: UserType) => {
        return [
            safe(u?.grade?.name),
            safe(u?.firstName),
            safe(u?.lastName),
            safe(u?.paternalSurname),
            safe(u?.maternalSurname)
        ].join(" ").trim();
    };


    let y = 60;

    const addCenteredText = (text: string, yPos: number, size = 11, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPos);
    };

    const nextLine = (amount = 14) => {
        if (y + amount > pageHeight - marginBottom) {
            doc.addPage();
            y = 60
            doc.setFontSize(fontSize);
        } else {
            y += amount;
        }

    };

    const drawJustifiedText = (
        spans: TextSpan[],
        defaultFont = "helvetica",
        defaultStyle = "normal"
    ) => {
        const words: { word: string, spanIndex: number }[] = [];

        spans.forEach((span, index) => {
            span.text.split(/\s+/).forEach(word => {
                if (word.trim()) words.push({ word, spanIndex: index });
            });
        });

        const spaceWidth = doc.getTextWidth(" ");
        const maxExtraSpace = spaceWidth * 2;
        let lineWords: typeof words = [];
        let currentLineWidth = 0;

        const drawLine = (lineWords: typeof words, justify: boolean) => {
            const textLine = lineWords.map(w => w.word).join(" ");
            const textWidth = doc.getTextWidth(textLine);
            const spaceCount = lineWords.length - 1;
            let extraSpace = 0;

            if (justify && spaceCount > 0) {
                extraSpace = (usableWidth - textWidth) / spaceCount;
                if (extraSpace > maxExtraSpace) {
                    extraSpace = 0;
                    justify = false;
                }
            }

            let x = marginLeft;

            for (let i = 0; i < lineWords.length; i++) {
                const { word, spanIndex } = lineWords[i];
                const span = spans[spanIndex];

                const font = span.font || defaultFont;
                const style = span.style || defaultStyle;
                const textColor = span.textColor || [0, 0, 0];
                const bgColor = span.bgColor;

                const wordWidth = doc.getTextWidth(word);
                const padding = 1;

                if (bgColor) {
                    doc.setFillColor(...bgColor);
                    doc.rect(x - padding, y - fontSize + 2, wordWidth + 2 * padding, fontSize + 2, "F");
                }

                doc.setFont(font, style);
                doc.setTextColor(...textColor);
                doc.text(word, x, y);

                x += wordWidth + spaceWidth + (justify ? extraSpace : 0);
            }

            nextLine(lineHeight + 5)
        };

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = doc.getTextWidth(word.word);
            const totalWidth = wordWidth + spaceWidth;

            if (currentLineWidth + totalWidth > usableWidth) {
                drawLine(lineWords, true);
                lineWords = [];
                currentLineWidth = 0;
            }

            lineWords.push(word);
            currentLineWidth += totalWidth;
        }

        if (lineWords.length > 0) {
            drawLine(lineWords, false);
        }

        doc.setFont(defaultFont, defaultStyle);
        doc.setTextColor(0, 0, 0);
    };

    addCenteredText(
        `SERVICIOS DE LA UNIDAD DE RADIO PATRULLA “110” CORRESPONDIENTE AL`,
        y,
        13,
        "bold"
    );
    nextLine(15);
    addCenteredText(`DÍA ${formatearConDia(date || today).toUpperCase()}`, y, 13, "bold")
    nextLine(20)

    turnos?.forEach((t) => {
        addCenteredText(t.turno, y, 12, 'bold');
        nextLine(15)
        if (t.denuncias_general.length > 0) {
            t.denuncias_general?.forEach((d) => {
                drawJustifiedText([
                    { text: `HORA ${format(new Date(d?.complaint?.createdAt), 'HH:mm')} ${d.complaint?.complaints?.name}.- `, style: 'bold' },
                    { text: d.description || '' }
                ])
            })
        } else {
            addCenteredText('Sin Novedad', y, 12, 'bold')
        }
        nextLine(15)
    })

    addCenteredText(
        `FALTA Y CONTRAVENCIONES ATENDIDAS POR RADIO PATRULLAS 110`,
        y,
        13,
        "bold"
    );
    nextLine(15);

    const head = buildHead(turnos);
    const body = buildBody(turnos);

    autoTable(doc, {
        head,
        body,
        startY: y,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bolditalic'
        },
    });

    y = doc.lastAutoTable.finalY + 60;

    const firmasPorFila = 2;
    const anchoFirma = 180 / firmasPorFila;
    let xfirma = marginLeft;
    let contadorFirma = 0;
    const separacionX = 30;

    despachadores.forEach((val, index) => {

        const nombreFirmante = fullName(val);
        const cargoFirmante = "DESPACHADOR DE SERVICIO";
        const alturaFirma = 50;
        if (y + alturaFirma > pageHeight - marginBottom) {
            doc.addPage();
            y = marginTop;
        }

        const nombreWidth = doc.getTextWidth(nombreFirmante);
        const nombreX = xfirma + (anchoFirma - nombreWidth) / 2;

        const cargoWidth = doc.getTextWidth(cargoFirmante);
        const cargoX = xfirma + (anchoFirma - cargoWidth) / 2;

        addText(nombreFirmante, nombreX, 11, "bold");
        nextLine(14)
        addText(cargoFirmante, cargoX);

        contadorFirma++;

        const esUltimo = index === despachadores.length - 1;
        const completaFila = contadorFirma % firmasPorFila === 0;

        if (completaFila || esUltimo) {
            nextLine(alturaFirma);
            xfirma = marginLeft;
        } else {
            xfirma += anchoFirma + separacionX;
        }
    });

    nextLine(20);
    addText(fullName(sub), marginLeft, 11, "bold");
    nextLine(14);
    addText("COMANDANTE DE RADIO PATRULLAS 110", marginLeft);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
};


const buildHead = (result: Turno[]): CellInput[][] => {
    const halignCenter: HAlignType = "center";
    const valignMiddle: VAlignType = "middle";

    return [
        [
            {
                content: "CASOS ATENDIDOS",
                rowSpan: 2,
                styles: { halign: halignCenter, valign: valignMiddle }
            },
            ...result?.map((r, i) => ({
                content: `TURNO ${i + 1}`,
                styles: { halign: halignCenter }
            })),
            {
                content: "TOTAL CASOS",
                rowSpan: 2,
                styles: { halign: halignCenter, valign: valignMiddle }
            }
        ],
        [
            ...result.map(r => ({
                content: `${r.desde} - ${r.hasta}`,
                styles: { halign: halignCenter }
            }))
        ]
    ];
};

const buildBody = (result: Turno[]): (string | number)[][] => {
    const tipos = new Set<string>();

    result.forEach(r => {
        Object.keys(r.denuncias).forEach(t => tipos.add(t));
    });

    const body: (string | number)[][] = [];

    tipos.forEach(tipo => {
        const row = [tipo];

        let totalTipo: any = 0;

        result.forEach(r => {
            const val: any = r.denuncias[tipo] ?? 0;
            row.push(val);
            totalTipo += val;
        });

        row.push(totalTipo);
        body.push(row);
    });
    const rowPos: any = ["total casos positivos"];
    let totalPos = 0;
    result.forEach(r => { rowPos.push(r.positivos); totalPos += r.positivos; });
    rowPos.push(totalPos);
    body.push(rowPos);
    const rowNeg: any = ["total casos negativos"];
    let totalNeg = 0;
    result.forEach(r => { rowNeg.push(r.negativos); totalNeg += r.negativos; });
    rowNeg.push(totalNeg);
    body.push(rowNeg);

    const rowTotal: any = ["total general de casos atendidos"];
    let totalGen = 0;
    result.forEach(r => { rowTotal.push(r.total); totalGen += r.total; });
    rowTotal.push(totalGen);
    body.push(rowTotal);

    return body;
}

const formatearConDia = (f: string) => {
    const fecha = new Date(f);

    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const diaSemana = dias[fecha.getUTCDay()];
    const diaMes = fecha.getUTCDate();
    const mes = meses[fecha.getUTCMonth()];
    const anio = fecha.getUTCFullYear();

    return `${diaSemana} ${diaMes} de ${mes} de ${anio}`;
};


