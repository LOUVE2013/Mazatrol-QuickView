(function () {
  function nativeApi() {
    return window.__TAURI__ && window.__TAURI__.dialog && window.__TAURI__.fs
      ? window.__TAURI__
      : null;
  }

  function basename(path) {
    return String(path).split(/[\\/]/).pop() || 'program';
  }

  async function waitForQuickview(name) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (typeof window[name] === 'function') return window[name];
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error('Interfejs aplikacji nie zakończył inicjalizacji.');
  }

  async function filesFromPaths(paths) {
    const tauri = nativeApi();
    return Promise.all(paths.map(async (path) => {
      const bytes = await tauri.fs.readFile(path);
      return new File([bytes], basename(path));
    }));
  }

  async function openPrograms(textMode) {
    const tauri = nativeApi();
    if (!tauri) return;

    // Deliberately show all files: machine programs can have proprietary or no extension.
    const selected = await tauri.dialog.open({ multiple: textMode });
    if (!selected) return;
    const paths = Array.isArray(selected) ? selected : [selected];
    const files = await filesFromPaths(paths);

    if (textMode) await (await waitForQuickview('__quickviewOpenIsoFiles'))(files);
    else if (files[0]) await (await waitForQuickview('__quickviewOpenFile'))(files[0]);
  }

  async function openDroppedPaths(paths) {
    const files = await filesFromPaths(paths);
    const textMode = files.some((file) =>
      /\.(EIA|ISO|MIN|PAD|H|NC|CNC|TAP|TXT|NGC|MPF)$/i.test(file.name) || !file.name.includes('.')
    );
    if (textMode) await (await waitForQuickview('__quickviewOpenIsoFiles'))(files);
    else if (files[0]) await (await waitForQuickview('__quickviewOpenFile'))(files[0]);
  }

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target && target.closest('#openBtn, #browseBtn, #openIsoBtn');
    if (!button || !nativeApi()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openPrograms(button.id === 'openIsoBtn').catch((error) => {
      window.alert('Nie udało się otworzyć pliku: ' + error.message);
    });
  }, true);

  document.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !target.closest('#closeAppBtn') || !nativeApi()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (window.__quickviewHasUnsavedEdits() &&
        !await window.__TAURI__.dialog.ask('Są niezapisane zmiany w programie. Zamknąć i je odrzucić?', {
          title: 'Niezapisane zmiany',
          kind: 'warning'
        })) return;
    await window.__TAURI__.window.getCurrentWindow().destroy();
  }, true);

  if (nativeApi() && window.__TAURI__.webview) {
    window.__TAURI__.webview.getCurrentWebview().onDragDropEvent((event) => {
      const app = document.getElementById('app');
      if (event.payload.type === 'enter' || event.payload.type === 'over') {
        app.classList.add('drop-active');
      } else {
        app.classList.remove('drop-active');
      }
      if (event.payload.type === 'drop') {
        openDroppedPaths(event.payload.paths).catch((error) => {
          window.alert('Nie udało się odczytać upuszczonego pliku: ' + error.message);
        });
      }
    });
  }

})();
