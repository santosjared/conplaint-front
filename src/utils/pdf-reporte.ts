import { jsPDF } from "jspdf";
import { UserType } from "src/types/types";
import autoTable, { HAlignType, VAlignType } from "jspdf-autotable";
import { CellInput } from "jspdf-autotable";

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: {
            finalY: number;
            [key: string]: number;
        };
    }
}


interface Turno {
    turno: string;
    desde: string;
    hasta: string;
    denuncias: Record<string, number>;
    positivos: number;
    negativos: number;
    total: number;
}

export const PDFReporte = (turnos: Turno[], despachadores: UserType[], sub: UserType) => {
    const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });

    const cmToPt = (cm: number): number => cm * 28.35;

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

    const marginTop = cmToPt(2.5);
    const marginBottom = cmToPt(2.5);
    const marginLeft = cmToPt(3);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 60;

    const addCenteredText = (text: string, yPos: number, size = 11, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPos);
    };

    const nextLine = (amount = 14) => { y += amount; };

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

    nextLine(doc.lastAutoTable.finalY + 10);

    const firmasPorFila = 2;
    const firmasHeight = 40;
    const anchoFirma = 180 / firmasPorFila;
    let xfirma = marginLeft;
    let contadorFirma = 0;
    const separacionX = 30;

    despachadores.forEach((val, index) => {

        const nombreFirmante = fullName(val);
        const cargoFirmante = "DESPACHADOR DE SERVICIO";

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
            nextLine(firmasHeight + 10)
            xfirma = marginLeft;
            if (y + 34 > pageHeight - marginBottom) {
                doc.addPage();
                y = marginTop;
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8);
            }
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
            ...result.map((r, i) => ({
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


