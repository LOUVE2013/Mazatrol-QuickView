# Rejestr źródeł i formatów

Rejestr publicznych źródeł sprawdzono 2026-11-10; lokalny pakiet Okuma uzupełniono 2026-11-13. To rejestr techniczny i wstępna kontrola licencji, nie opinia prawna. Przed publikacją należy ponownie sprawdzić licencję dokładnej wersji każdego źródła, zależności, autorstwo lokalnych kopii i prawa do wszystkich próbek.

## Zasady obsługi formatów

- Wspólny może być edytor tekstu: odczyt kodowania, zachowanie BOM i końców wierszy, kolorowanie, edycja oraz zapis jako nowa kopia.
- Parser i grafika wymagają profilu konkretnego sterowania lub dialektu. Rozszerzenie `.MPF`, `.H`, `.MIN`, `.NC` ani nazwa producenta same nie dowodzą, że pliki mają tę samą składnię.
- Nieznane konstrukcje trzeba zachowywać i pokazywać bez dopowiadania ich znaczenia. Samo kolorowanie składni nie jest parserem, symulatorem ani potwierdzeniem zgodności z maszyną.
- Programy użytkownika i instrukcje maszynowe są materiałem referencyjnym. Nie publikować ich bez potwierdzonych praw i odrębnej zgody właściciela.

## Źródła już wykorzystane w QuickView

| `CncEditor-Okuma-v14-okuma-regresja/` (materiał przekazany lokalnie) | W dostarczonym katalogu nie znaleziono pliku licencji. | Przejrzano jako opis zachowania Okuma OSP; do QuickView nie skopiowano źródeł C# ani komponentów WPF. `gcode-preview.js` napisano osobno dla przeglądarki. Nie dołączać katalogu ani plików źródłowych tego projektu do publicznej paczki bez ustalenia praw. |


| Źródło | Licencja / pochodzenie | Wykorzystanie i uwagi |
|---|---|---|
| [`edonavon/mazak`](https://github.com/edonavon/mazak), `qts200m.xml` | Repozytorium oznaczone GPL-2.0 | Profil bloków PBG QTS 200M. Zasady dekodowania są włączone do QuickView; atrybucja znajduje się w [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Nie używamy `mcode.csv`, bo M-code zależy od konfiguracji konkretnej maszyny. |
| MazEdit, lokalna kopia `MazEdit-main/` | Lokalny `LICENSE` zawiera MIT i copyright Yulian (2026); README opisuje dekoder `.MAZ`. Publicznego repozytorium źródłowego nie udało się potwierdzić. | Wykorzystane są układ nagłówka, znaczniki i pola `.MAZ` oraz rozpoznawanie nagłówków MG3 EIA/PAD. Przed publikacją trzeba potwierdzić pochodzenie tej kopii i prawa do wskazanych materiałów. Pełny tekst MIT i atrybucja są w [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). |
| [`HakimHisham1991/mazatrol-reader-aero`](https://github.com/HakimHisham1991/mazatrol-reader-aero), „Mazatrol Web” | Publiczne repozytorium oznaczone MIT | Wykorzystane są mapy jednostek PBF/PBD/M6M, fallback PBE→PBG, flagi wartości opcjonalnych, rozwiązywanie slotów M6M i struktura eksportu HTML. Symulator 3D nie został przeniesiony. Próbki z `SAMPLE_NC_PROGRAM/` nie są częścią QuickView i nie powinny być publikowane bez osobnej kontroli praw. Pełny tekst MIT i atrybucja są w [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). |
| QMazEdit, lokalne kopie `qmazedit222/` i `qmazedit-code-r2-trunk/` | [SourceForge opisuje projekt jako GPLv2](https://sourceforge.net/projects/qmazedit/), natomiast obie lokalne kopie mają tekst licencji GPLv3, a nagłówki źródeł mówią „GPL version 2 or later”. Projekt jest oznaczony jako porzucony. | Służył tylko do porównania układu `.M64/.M66`; aktywnego dekodera tych rekordów nie znaleziono. Nie włączono kodu QMazEdit. Rozbieżność lokalnych kopii pozostaje nierozstrzygnięta. |

## Próbki i materiały lokalne

| Ścieżka / materiał | Ustalenie |
|---|---|
| `examples/` | Zestaw próbek przygotowanych przez maintenera do testowania odczytu i podglądu. Maintainer sprawdził pliki i potwierdził, że mogą być opublikowane. Nazwy plików wskazują typy maszyn; próbki nie stanowią gwarancji pełnej zgodności z danym sterowaniem. |`r`n| Pozostałe lokalne programy, katalogi TBI/DMG/YDPM/Hartford i pliki CNC poza `examples/` | Nie są częścią kandydata repozytorium; nie dodawać bez odrębnego przeglądu praw i treści. |
| `Programing_ISO.pdf`, `Programing_mazatrol.pdf`, `Operating_manual.pdf`, `Part_list.pdf`, `Alarm_list.pdf`, `rowki.pdf` | Instrukcje i dokumentacja producentów. Można z nich korzystać jako prywatnego materiału referencyjnego; nie kopiować do publicznego repozytorium bez sprawdzenia praw. |
| `MazatrolViewer/` | Zawiera EXE, DLL i dane; nie znaleziono licencji pozwalającej na redystrybucję. Nie kopiować ani nie dołączać binariów do QuickView. |
| `MazEdit-main/`, `mazak-master/`, `mazatrol-reader-aero-main/`, `qmazedit222/`, `qmazedit-code-r2-trunk/` | Pełne lokalne kopie projektów służą do audytu. QuickView nie potrzebuje ich katalogów podczas działania. Do wydania dołączamy wyłącznie własny kod i wymagane atrybucje/licencje. |
| `download (1).png` | Lokalny plik pomocniczy; nie jest używany przez `index.html` i nie ma ustalonego źródła/licencji. Zostaje wykluczony z Git. |

Powyższe lokalne ścieżki dodano do [.gitignore](.gitignore), aby ograniczyć ryzyko ich przypadkowego dodania. Ignorowanie nie usuwa żadnych plików. Przed publikacją trzeba sprawdzić `git status` oraz zawartość archiwum/release.

## Publiczne źródła przydatne dla kolejnych sterowań

Status licencji poniżej pochodzi z licencji lub metadanych wskazanych projektów. „Kandydat” oznacza materiał do dalszego przeglądu, a nie gotowy parser kompatybilny z QuickView.

### Wspólne kolorowanie, tokenizacja i widok przeglądarkowy

| Projekt | Licencja | Potencjalna wartość | Granice zastosowania |
|---|---|---|---|
| [`cncjs/gcode-parser`](https://github.com/cncjs/gcode-parser) | MIT | Parser JavaScript do rozbicia typowych słów G-code na tokeny; warto sprawdzić także opcje zachowania formatu wierszy. | Parser ogólny nie zna cykli Mazaka, Sinumerika, Fanuca ani Heidenhaina. Nie powinien przepisywać źródła podczas zapisu. |
| [`appliedengdesign/vscode-gcode-syntax`](https://github.com/appliedengdesign/vscode-gcode-syntax) | MIT | Gramatyki, wzorce kolorowania i pliki przykładowe. README deklaruje m.in. rozszerzenia `.MIN` i `.MPF`. | Rozpoznanie rozszerzenia nie potwierdza obsługi semantyki programu ani konkretnego sterowania. |
| [`jeyeager65/cnc-gcode-tools`](https://github.com/jeyeager65/cnc-gcode-tools) | MIT | Przeglądarkowy podgląd ścieżki i modelu materiału; działa dla FluidNC/GRBL. | Jego parser i symulacja są ukierunkowane na GRBL/FluidNC; nie przenosić założeń na inne maszyny. |
| [`xyz-tools/gcode-preview`](https://github.com/xyz-tools/gcode-preview) | MIT | Strumieniowy parser i renderer WebGL jako przykład implementacji webowej. | Projekt opisuje się jako narzędzie z myślą o druku 3D; ekstruder i założenia drukarkowe nie są semantyką frezarki/tokarki CNC. |

### Osobne dialekty sterowań

| Projekt | Licencja | Co warto badać | Ograniczenie |
|---|---|---|---|
| [`CEAD-group/nc-gcode-interpreter`](https://github.com/CEAD-group/nc-gcode-interpreter) | MIT | Interpreter NC w dialekcie Sinumerik; potencjalna baza wiedzy dla zmiennych, makr, skoków i konstrukcji wysokiego poziomu. | Implementacja Rust/Python wymagałaby osobnego portu lub komponentu; przed użyciem sprawdzić zależności i zachowanie na konkretnym MPF. |
| [`deathaxe/sublime-s840d`](https://github.com/deathaxe/sublime-s840d) | MIT | Kolorowanie i słownictwo SINUMERIK 840D/ONE, cykle oraz przykładowe pliki. | To wsparcie edytora, nie walidator; katalogi dokumentacji kontrolera mogą mieć osobne warunki i nie należy ich kopiować. |
| [`Adam-Menashe-Keysight/vscode-heidenhain-syntax`](https://github.com/Adam-Menashe-Keysight/vscode-heidenhain-syntax) | MIT | Wzorce kolorowania HEIDENHAIN jako punkt odniesienia dla plików TBI `.H` (`BEGIN PGM`, `CYCL DEF`, ruchy i komentarze). | Nie dowodzi zgodności z konkretną wersją sterowania TBI ani nie interpretuje cykli. |
| [`cnc4me/fanuc-macro-b`](https://github.com/cnc4me/fanuc-macro-b) | MIT | Lexer, parser i interpreter Fanuc Macro B; osobny przyszły profil dla makr Fanuca. | Nie używać do zwykłego ISO ani innych sterowań; interpreter wymaga własnych próbek i walidacji. |

### Symulacja i źródła do nauki

| Projekt / dokument | Licencja lub warunek | Przydatność |
|---|---|---|
| [`CAMotics`](https://github.com/CauldronDevelopmentLLC/CAMotics) | GPL-2.0 | Dojrzały przykład symulacji 3-osiowego G-code; kod C++ i aplikacja desktopowa, więc to raczej materiał architektoniczny niż komponent dla pojedynczego HTML. Sprawdzać licencje zależności i poszczególnych plików przed kopiowaniem. |
| [NIST RS274/NGC Interpreter, Version 3](https://www.nist.gov/publications/nist-rs274ngc-interpreter-version-3) | Dokument techniczny; licencję kodu należy oceniać osobno od publikacji | Formalne źródło pojęć i zachowania klasycznego RS274/NGC. Nie zakładać, że opis obejmuje rozszerzenia producentów. |
| [LinuxCNC: G-code overview](https://linuxcnc.org/docs/html/gcode/overview.html) | Dokumentacja techniczna; przed kopiowaniem treści sprawdzić jej licencję | Referencja składni dla LinuxCNC/RS274; nie jest uniwersalną specyfikacją wszystkich maszyn. |
| [Siemens SINUMERIK manuals](https://support.industry.siemens.com/) | Dokumentacja producenta; nie traktować jako materiał do redystrybucji | Ustalać wersję sterowania i właściwy podręcznik dla konkretnej maszyny, zwłaszcza dla cykli i słów wysokiego poziomu. |

### Źródła wykluczone przy obecnej licencji projektu

Projekt ma obecnie GNU GPL v2-only. Wartościowy komponent na GPLv3 lub AGPLv3 nie może być automatycznie łączony z kodem GPLv2-only; zmiana licencji wymaga praw do wszystkich łączonych części i nie zmienia licencji autorów zewnętrznych. W tej turze nie znaleziono powodu, by zmieniać główną licencję: użyte źródła MIT oraz mapa GPL-2.0 są zgodne z aktualnym kierunkiem projektu.

- [`pygcode`](https://github.com/fragmuffin/pygcode) — GPLv3; dobry materiał do nauki, nie przenosić kodu do obecnego projektu.
- [`gcode-lisa`](https://github.com/dasarne/gcode-lisa) — AGPLv3; edytor/serwer CNC, nie przenosić bez odrębnej decyzji licencyjnej.
- [`GCodeWorkShop`](https://github.com/GCodeProjects/GCodeWorkShop) — GPLv3/LGPLv3; funkcje edytora i symulacji mogą być inspiracją, ale kod nie jest kandydatem do włączenia w obecnym stanie licencji.
- [`pbosetti/c-cnc`](https://github.com/pbosetti/c-cnc) — CC BY-NC-SA 4.0; ograniczenie niekomercyjne nie pasuje do projektu, który ma być ogólnodostępny i swobodnie używany.

Do sprawdzenia kompatybilności i warunków użycia służy [lista licencji FSF](https://www.gnu.org/licenses/license-list.html) oraz [FAQ GNU o zgodności licencji](https://www.gnu.org/licenses/gpl-faq.en.html). GitHub wyjaśnia, że samo umieszczenie publicznego kodu bez licencji nie przyznaje domyślnie praw do jego kopiowania i rozpowszechniania: [Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Rekomendowana kolejność prac technicznych

1. Zachować wspólny edytor i zapis kopii jako warstwę tekstową niezależną od parserów.
2. Rejestrować osobne profile dla ISO/EIA, TBI/Heidenhain, DMG/Sinumerik i kolejnych sterowań dopiero po zebraniu próbek oraz potwierdzeniu wersji sterownika. YDPM i Hartford traktować na razie jako dwa zbiory przykładów ISO-podobnych, nie jeden zatwierdzony dialekt.
3. Najpierw dodawać kolorowanie i odczyt rozpoznanych słów; interpretację makr, cykli i rysowanie ścieżek włączać osobno po weryfikacji na kilku programach.
4. Do publicznego repozytorium przygotować syntetyczne, odanonimizowane próbki, które nie zawierają nazw detali, klientów, ścieżek produkcyjnych ani danych technologicznych.

## Stan kandydata do repozytorium

Kandydat dla publicznego repozytorium zawiera desktopowy prototyp Tauri 0.1.23 (frontend v1.5.103), dokumentację, pliki licencyjne, workflow GitHub Actions oraz zatwierdzone próbki w `examples/`. Lokalne kopie projektów referencyjnych, pliki buildów i pozostałe prywatne materiały nie są częścią tego folderu.