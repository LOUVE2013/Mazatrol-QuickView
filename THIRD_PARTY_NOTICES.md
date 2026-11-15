# Third-party notices

QuickView adapts the following format maps and decoding rules. Downloaded project trees are research copies, are excluded from this repository, and are not needed to run QuickView. The research register and upstream links are in [SOURCES.md](SOURCES.md).

## Mazak QTS 200M map

Source: [edonavon/mazak](https://github.com/edonavon/mazak), file `qts200m.xml`  
Included material: QTS 200M PBG block identifiers and format-field definitions used by the read-only PBG profile.

The upstream repository identifies its license as GNU GPL version 2. The adapted PBG profile is distributed under the same terms; the full license text is in the root [LICENSE](LICENSE) file. QuickView does not use the repository's `mcode.csv`.

## MazEdit

Local reference copy: `MazEdit-main/` (excluded from release)  
Upstream source: not identified yet; see [SOURCES.md](SOURCES.md)  
Included material: `.MAZ` header and 100-byte record layout, known marker/field offsets, tool and figure labels, and MG3 EIA/PAD header patterns. These rules are implemented in QuickView as a read-only decoder and text-header parser.

Copyright (c) 2026 Yulian

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Mazatrol Web

Upstream project: [HakimHisham1991/mazatrol-reader-aero](https://github.com/HakimHisham1991/mazatrol-reader-aero) (MIT); local reference copy `mazatrol-reader-aero-main/` is excluded from release.  
Included material: PBF/PBD/M6M unit definitions and value decoding rules from the structure XML files, the PBE fallback to the PBG map, M6M slot ID resolution, optional-value flags, packed PBD tool fields, and the UNo./SNo./FIG structure used to read the sample HTML exports. QuickView uses these maps and export structures for read-only program display.

Copyright (c) 2026 HakimHisham1991

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
