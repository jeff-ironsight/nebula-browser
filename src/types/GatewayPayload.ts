export interface HelloEvent {
    heartbeat_interval_ms: number
}

export interface IdentifyEvent {
    token: string
}

export interface SubscribeEvent {
    channel_id: string
}

export interface MessageCreateEvent {
    channel_id: string
    content: string
}

export interface DispatchEvent {
    t: string
    d: Record<string, unknown>
}

export type GatewayPayload =
    | { op: 'Hello'; d: HelloEvent }
    | { op: 'Identify'; d: IdentifyEvent }
    | { op: 'Subscribe'; d: SubscribeEvent }
    | { op: 'MessageCreate'; d: MessageCreateEvent }
    | { op: 'Dispatch'; d: DispatchEvent }