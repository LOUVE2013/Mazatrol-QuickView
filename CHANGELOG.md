## 0.1.23
- Naprawiono błąd składni blokujący inicjalizację frontendu, otwieranie plików metodą przeciągnij i upuść oraz zapis kopii.
- Wersja frontendu: v1.5.103.

## 0.1.22
- Zapis kopii działa dla plików binarnych Mazatrol oraz tekstowych G-code/ISO; tekst zachowuje wybrane kodowanie i końce wierszy.
- Przeciąganie plików czeka na gotowość interfejsu przed przekazaniem ich do parsera.
- Wersja frontendu: v1.5.102.

## 0.1.21
- Dodano przełącznik wygaszania procesów w trybie kontroli; po wyłączeniu procesy są wyróżniane kolorem.
- Dodano zapis binarnych plików Mazatrol jako kopii bajt w bajt pod nową nazwą.
- Wersja frontendu: v1.5.101.

## 0.1.20
- Uchwyt zmiany wysokości grafiki G-code znajduje się bezpośrednio między grafiką a paskiem programu; rozmiar nie zmienia się po przełączeniu rzutu.
- Wersja frontendu: v1.5.100.

## 0.1.19
- Dodano uchwyt do zmiany wysokości grafiki przeciąganiem lub klawiszami strzałek. Uchwyt nie zmienia układu paneli ani nie przechwytuje kółka myszy; jest widoczny tylko przy grafice.
- Wersja frontendu: v1.5.99.

## 0.1.18
- Uzupełniono selektor tłumaczeń o przyciski otwierania Mazatrol/G-code, zamykanie programu, opis strony i cały pasek podglądu G-code; dodano etykiety “Close” i “Close program”.
- Doprecyzowano wspólną projekcję izometryczną: ujemne wartości Z są kierowane ku górze dla obsługiwanych dialektów z grafiką.
- Wersja frontendu: v1.5.98.
## 0.1.17
- Uproszczono zmianę języka do jednego tłumacza i jednego obserwatora; przełączanie PL/EN korzysta z zapamiętanych tekstów źródłowych, co usuwa konflikt tłumaczeń przy powrocie do polskiego.
- Połączono tłumaczenia interfejsu, statusów ISO/DMG i legend PBQ w jednym mechanizmie; nazwy skrótów procesów Mazak pozostają bez zmian.
- Wersja frontendu: v1.5.97.

# Historia zmian — prototyp Tauri

## 0.1.16
- Ograniczono tłumaczenie do elementów interfejsu, aby przełączanie języka nie skanowało dużych programów CNC.
- Wersja frontendu: v1.5.96.

## 0.1.15
- Naprawiono pętlę aktualizacji obserwatora tłumaczeń, która mogła blokować otwieranie programów.
- Wersja frontendu: v1.5.95.

## 0.1.14
- Poprawiono angielskie tłumaczenia statusów i ostrzeżeń ISO/DMG.
- Dodano angielski opis legendy konturów Mazatrol PBQ/PBN; nazwy procesów pozostają bez zmian.
- Wersja frontendu: v1.5.94.

## 0.1.13
- Dodano przełącznik PL/EN i tłumaczenia interfejsu, kontrolerów ISO/G-code oraz legendy.
- Zachowano bez tłumaczenia nazwy i skróty struktury programów Mazak/PBQ.
- Wersja frontendu: v1.5.93.

## 0.1.12
- Dodano parser ruchów HEIDENHAIN Klartext dla TBI: L, CR, FMAX i współrzędne dziesiętne z przecinkiem.
- Wymiary BLK FORM są rysowane jako przerywany obrys półfabrykatu w wybranym rzucie.
- Dodano ostrzeżenia o nieinterpretowanych cyklach, FN oraz odniesieniach M91/M92.
- Wersja frontendu: v1.5.92.

## 0.1.11
- Dodano podgląd ścieżki XYZ dla plików Siemens SINUMERIK / DMG MPF, z ruchami G0–G3 i wyborem rzutu.
- Podgląd wyświetla ostrzeżenie o nieinterpretowanych cyklach, parametrach R i transformacjach sterowania.
- Wersja frontendu: v1.5.91.

## 0.1.10
- Dodano przybliżanie kółkiem myszy do grafiki ISO/EIA i konturu PBQ/Mazatrol; zoom jest zakotwiczony pod kursorem.
- Dodano przycisk Dopasuj do widoku początkowego obu grafik.
- Podgląd ISO/EIA ma przełącznik Pokaż G0 i rozszerzoną legendę ruchów, cykli oraz osi.
- Wersja frontendu: v1.5.90.

## 0.1.9
- Uwidoczniono wybór rzutu grafiki etykietą „Widok osi” i poszerzono listę opcji.
- Nazwy trybów dopasowano do aplikacji referencyjnej CncEditor V14.
- Wersja frontendu: v1.5.89.

## 0.1.8
- Dodano wybór projekcji grafiki G-code: auto według pierwszego ruchu, XZ, XY, YZ i izometryczny XYZ.
- Podgląd rysuje ruchy programu w wybranej projekcji, z osiami oznaczonymi kolorami i nazwami.
- W widoku izometrycznym interpolowane są również ruchy helikalne.
- Wersja frontendu: v1.5.88.

## 0.1.7
- Naprawiono podgląd grafiki G-code w aplikacji desktopowej przez dołączenie modułu gcode-preview.js do frontendu Tauri.
- Wersja frontendu: v1.5.87.

## 0.1.6
- Dodano wspólny moduł podglądu geometrii ISO/Okuma i poprawki odczytu pól PBQ/PBN.
- Zaktualizowano wersję frontendu do v1.5.86.

## 0.1.5
- Oznaczono blok 248 jako dodatkowy rekord procesu SCH i wyświetlamy go wśród bloków pomocniczych zamiast jako nieznany proces.

## 0.1.4
- Dodano ikonę aplikacji i uprawnienie zamykania okna.
