import { TIdentity } from '@/platform/identity'

declare module 'hono' {
    interface ContextVariableMap {
        user: TIdentity
    }
}
