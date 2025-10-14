# AuthenticatorTransport

Describes the transport mechanisms an authenticator (e.g., security key, platform biometric) can use to communicate with the client.

Supported values:
- `ble` — Bluetooth Low Energy. Used by mobile or external authenticators that connect over BLE.
- `hybrid` — Hybrid transport. Authenticators that may support multiple transport mechanisms (vendor-specific).
- `internal` — Platform/internal authenticator. Built-in authenticators such as device biometrics (Touch ID, Windows Hello).
- `nfc` — Near Field Communication. Contactless authenticators (cards, tokens) that use NFC.
- `usb` — USB. External authenticators connected over USB (including USB-C / USB-A keys).

Usage (TypeScript):
```ts
import type { AuthenticatorTransport } from '../backend/src/types/auth.types';

// Example: accepted transports for a credential
const transports: AuthenticatorTransport[] = ['usb', 'nfc'];
```

Reference: source type definition located at `src/types/auth.types.ts` (search for `AuthenticatorTransport`).
