import type { DispatchEvent } from './DispatchEvent.ts';
import type { HelloEvent } from './HelloEvent.ts';
import type { IdentifyEvent } from './IdentifyEvent.ts';
import type { MessageCreateEvent } from './MessageCreateEvent.ts';
import type { SubscribeEvent } from './SubscribeEvent.ts';

export type WsGatewayPayload =
  | { op: 'Hello'; d: HelloEvent }
  | { op: 'Identify'; d: IdentifyEvent }
  | { op: 'Subscribe'; d: SubscribeEvent }
  | { op: 'MessageCreate'; d: MessageCreateEvent }
  | { op: 'Dispatch'; d: DispatchEvent }
