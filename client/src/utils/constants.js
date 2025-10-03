export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  MESSAGE_SENT: 'message-sent',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  USER_TYPING: 'user-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  MESSAGES_READ: 'messages-read'
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system'
}