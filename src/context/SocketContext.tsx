import { createContext, ReactNode, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import environment from "src/configs/environment"

export type Client = {
    name: string
    lastName: string
    email: string
    phone: string
    picture?: string
}

export type Kin = {
    name: string
}

export type TypeComplaints = {
    name: string
}

export type ComplaintsType = {
    complaints: TypeComplaints
    aggressor?: Kin
    victim?: Kin
    place?: string
    description?: string
    latitude?: string
    longitude?: string
    images?: string[]
    video?: string
    otherComplaints?: string
    otherAggressor?: string
    otherVictim?: string
    status?: string
    createdAt: string
    userId: Client
    _id?: string
}

export type DenunciasType = {
    name: string
    total: number
}

export type TotalType = {
    name: string
    total: number
}

export type SocketContextType = {
    waitingComplaints: ComplaintsType[]
    allComplaints: ComplaintsType[]
    denuncias: DenunciasType[]
    total_denuncias: TotalType[]
    getData: () => void
}

const defaultProvider: SocketContextType = {
    waitingComplaints: [],
    allComplaints: [],
    denuncias: [],
    total_denuncias: [],
    getData: () => {
        console.warn("getData called before SocketProvider initialized");
    }
}

export const SocketContext = createContext<SocketContextType>(defaultProvider)

type Props = { children: ReactNode }

export const SocketProvider = ({ children }: Props) => {
    const [waitingComplaints, setWaitingComplaints] = useState<ComplaintsType[]>([])
    const [allComplaints, setAllComplaints] = useState<ComplaintsType[]>([])
    const [denuncias, setDenuncias] = useState<DenunciasType[]>([])
    const [total_denuncias, setTotal_denuncias] = useState<TotalType[]>([])

    const socket: Socket = io(environment().backendURI, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
    })

    const getData = () => {

        socket.emit("emitNotification")
    }
    useEffect(() => {
        const handleData = (data: {
            waitingComplaints: ComplaintsType[]
            allComplaints: ComplaintsType[]
            denuncias: DenunciasType[]
            total_denuncias: TotalType[]
        }) => {
            const sortByDate = <T extends { createdAt: string }>(arr: T[]) =>
                [...arr].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            setWaitingComplaints(sortByDate(data.waitingComplaints || []))
            setAllComplaints(sortByDate(data.allComplaints || []))
            setDenuncias(data.denuncias || [])
            setTotal_denuncias(data.total_denuncias || [])
        }

        socket.on("onNotification", handleData)
        socket.connect()
        socket.emit("emitNotification")

        socket.on("connect", () => console.log("Socket conectado", socket.id))
        socket.on("disconnect", (reason) => console.log("Socket desconectado:", reason))
        socket.on("reconnect_attempt", (attempt) => console.log("Intentando reconectar...", attempt))

        return () => {
            socket.off("onNotification", handleData);
            socket.disconnect()
        }
    }, [])

    const values: SocketContextType = {
        waitingComplaints,
        allComplaints,
        denuncias,
        total_denuncias,
        getData
    }

    return <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
}
