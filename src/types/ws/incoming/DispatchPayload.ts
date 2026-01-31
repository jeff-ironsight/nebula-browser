import type { ErrorEvent } from './ErrorEvent.ts';
import type { MessageCreatedEvent } from './MessageCreatedEvent.ts';
import type { ReadyEvent } from './ReadyEvent.ts';

export type DispatchPayload =
  | { t: 'READY'; d: ReadyEvent }
  | { t: 'MESSAGE_CREATE'; d: MessageCreatedEvent }
  | { t: 'ERROR'; d: ErrorEvent }
