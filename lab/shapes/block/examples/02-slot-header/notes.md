# Header slot (Glamsterdam)

The lab header sets `slotNumber` to **42**. The recipient runs `SLOTNUM` then returns the 32-byte word. `header.slotNumber` and `transactions[0].returnValue` should both read as 42. Fusaka rejects `slotNumber`.
