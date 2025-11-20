import { jsPDF } from "jspdf";
import { UserType } from "src/types/types";

const today = new Date().toISOString().split('T')[0];

interface User {
    cargo?: string
    user: UserType
}

interface ZoneType {
    _id?: string
    name: string
}

interface Services {
    _id?: string
    name: string;
}

interface GgradeType {
    _id?: string
    name: string;
}

interface UserService {
    services: Services | null,
    zone: ZoneType | null,
    otherService: string,
    otherZone: string
    users: User[]
}

interface HourRange {
    name: string;
    hrs_i: string;
    hrs_s: string;
    services: UserService[];
}

interface ShiftsType {
    _id?: string;
    __v?: string;
    createdAt?: string
    updatedAt?: string
    date: string;
    grade?: GgradeType;
    supervisor: string;
    hrs: HourRange[];
}

export const PDFPersonal = (horario: ShiftsType | null, sub: UserType) => {
    const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });

    const marginLeft = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnRight = pageWidth - 340;

    let y = 60;

    const addText = (text: string, x = marginLeft, size = 11, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.text(text, x, y);
    };

    const addCenteredText = (text: string, yPos: number, size = 11, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPos);
    };

    const nextLine = (amount = 14) => { y += amount; };

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

    addCenteredText(
        `ORDEN DEL DÍA DE LA UNIDAD DE RADIO PATRULLA “110” CORRESPONDIENTE AL`,
        y,
        13,
        "bold"
    );
    nextLine(15);

    addCenteredText(`DÍA ${formatearConDia(horario?.date || today).toUpperCase()}`, y, 13, "bold")
    nextLine(20)

    const grade = horario?.grade?.name?.toUpperCase() || ''
    const supervisor = horario?.supervisor?.toUpperCase() || ''
    addText(`SUPERVISOR DE SERVICIO ${grade} ${supervisor}`, marginLeft, 12, "bold");
    nextLine(20)

    horario?.hrs?.forEach((turno) => {
        addCenteredText(turno.name.toUpperCase(), y, 12, "bold");
        nextLine(20);

        turno.services.forEach((serv) => {
            const serviceName = safe(serv.otherService || serv.services?.name);
            const zoneName = safe(serv.otherZone || serv.zone?.name);

            addText(`${serviceName}`, marginLeft, 11, "bolditalic");

            if (zoneName) {
                addText(zoneName, columnRight, 11, "bolditalic");
            }

            nextLine();

            serv.users.forEach(u => {
                const cargo = safe(u.cargo || u.user?.post?.name);
                const nombre = fullName(u.user);

                if (zoneName) {
                    addText(`  ${cargo}`, marginLeft);
                    addText(`${nombre}`, columnRight);

                } else {
                    addText(`  ${nombre}`, marginLeft);
                }

                nextLine();
            });

            nextLine(10);
        });

        nextLine(15);
    });

    nextLine(30);
    addText(fullName(sub), marginLeft, 11, "bold");
    nextLine(14);
    addText("COMANDANTE DE RADIO PATRULLAS 110", marginLeft);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
};


const formatearConDia = (f: string | Date) => {
    const fecha = new Date(f);

    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const diaSemana = dias[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${diaSemana} ${diaMes} de ${mes} de ${anio}`;
};

