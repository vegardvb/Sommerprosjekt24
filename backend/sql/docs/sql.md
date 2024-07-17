
# SQL Documentation

En henvendelse kan ha mange flere henvendelse_ledningsmaalinger ettersom en netteier som har en henvendelse kan ha flere oppdrag.En henvendelse_innmaaling trenger ikke nødvendigvis å ha registrerte innmålinger.

Samtidig kan ett oppdrag ha flere lednings_innmålinger.

henvendelse (1) -> (*) henvendelse_ledningsmaaling

henvendelse_ledningsmaaling (1) -> (*) lednings_innmaaling
