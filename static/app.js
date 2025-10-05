// Initialize map (centered on Earth)
    // Disable the default Leaflet zoom controls because we provide custom buttons
    const map = L.map('map', {
      center: [20, 0], // latitude, longitude
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      zoomSnap: 0.25,
      worldCopyJump: true,
      zoomControl: false
    });

    // --- Base Layer: NASA GIBS Blue Marble (natural color) ---
    // Tiles from NASA GIBS public endpoint
    const nasaLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "World",
        tileSize: 256,
        time: "2024-01-01", // pick any valid date
        maxZoom: 9,
      }
    );

    const viirisLayer = L.tileLayer(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
      {
        attribution: "MODIS Terra True Color © NASA GIBS",
        tileSize: 256,
        time: "2024-01-01",
        maxZoom: 9,
      }
    );

    const blueLayer = L.tileLayer(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
      {
        attribution: "MODIS Terra True Color © NASA GIBS",
        tileSize: 256,
        time: "2024-01-01",
        maxZoom: 9,
      }
    );

    const viirisrgbLayer = L.tileLayer(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
      {
        attribution: "MODIS Terra True Color © NASA GIBS",
        tileSize: 256,
        time: "2024-01-01",
        maxZoom: 9,
      }
    );

    const newLayer = L.tileLayer(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2025-10-04/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png",
      {
        attribution: "MODIS Terra Land Surface",
        tileSize: 256,
        time: "2024-01-01",
        maxZoom: 9,
      }
    );

    const new2Layer = L.tileLayer(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_SurfaceSoilTemperature/default/2025-10-04/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
      {
        attribution: "MODIS Terra Land Surface",
        tileSize: 256,
        time: "2024-01-01",
        maxZoom: 9,
      }
    );

    // Add base layer
    nasaLayer.addTo(map);

    // global layer control for main map (per-compare panes keep their own controls)
    const baseMaps = {
      "NASA Blue Marble": nasaLayer,
      "Viiris CityLight": viirisLayer,
      "Blue Marble": blueLayer,
      "Viiris RGB Layer": viirisrgbLayer,
      "MODIS Tera Land Surface Temp Day": newLayer,
      "SMAP Soil Moisture": new2Layer
    };
    L.control.layers(baseMaps).addTo(map);

    // Add scale bar
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    // Optional: click event (no label feature)
    map.on('click', function (e) {
      // default click shows coords
      alert(`Latitude: ${e.latlng.lat.toFixed(4)}, Longitude: ${e.latlng.lng.toFixed(4)}`);
    });

    // UI wiring for control bar
  document.getElementById('zoomIn').addEventListener('click', ()=>{ map.zoomIn(); if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.zoomIn()); });
  document.getElementById('zoomOut').addEventListener('click', ()=>{ map.zoomOut(); if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.zoomOut()); });
    const panToggle = document.getElementById('panToggle');
    panToggle.addEventListener('click', ()=>{
      const dragging = map.dragging.enabled();
      if(dragging){ map.dragging.disable(); panToggle.classList.remove('active'); panToggle.textContent='Pan'; if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.dragging.disable()); }
      else { map.dragging.enable(); panToggle.classList.add('active'); panToggle.textContent='Pan'; if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.dragging.enable()); }
    });
    // rotation controls removed
    document.getElementById('resetView').addEventListener('click', ()=>{
      // restore initial center/zoom
      map.setView([20,0], 2);
      if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.setView([20,0],2));
      // reset rotation
      const el = document.getElementById('map'); el.style.transform = 'none'; el.setAttribute('data-rot', 0);

      // remove MODIS overlay if present and reset compare button state
      const compareBtnEl = document.getElementById('compareToggle');
      try{ if(window.modisLayer && map.hasLayer(window.modisLayer)) map.removeLayer(window.modisLayer); }catch(e){}
  if(compareBtnEl) compareBtnEl.classList.remove('active');

      // reset opacity slider and layer opacity to default
  // nothing to reset for removed opacity/label features

  // ensure dragging/pan is enabled and update pan button state
      const panToggleEl = document.getElementById('panToggle');
      if(!map.dragging.enabled()) map.dragging.enable();
      if(panToggleEl) panToggleEl.classList.add('active');
  if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=>{ if(!cm.dragging.enabled()) cm.dragging.enable(); });

      // remove any user-added labels (markers with .user-label tooltip)
      const toRemove = [];
      map.eachLayer(layer => {
        try{
          if(layer instanceof L.Marker){
            const tt = layer.getTooltip ? layer.getTooltip() : null;
            if(tt && tt.options && tt.options.className === 'user-label'){
              toRemove.push(layer);
            }
          }
        }catch(e){}
      });
      toRemove.forEach(l => map.removeLayer(l));
    });
  document.getElementById('fitWorld').addEventListener('click', ()=>{ map.fitWorld(); if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=> cm.fitWorld()); });

    // compare toggle is handled by the compare-grid module below (keeps behavior consistent)

  // Side pane / hamburger logic
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidePane = document.getElementById('sidePane');
  const closePane = document.getElementById('closePane');
  const controlBar = document.querySelector('.control-bar');
  // default: move control bar into side pane vertically
  if(controlBar){ controlBar.classList.add('vertical'); sidePane.querySelector('.pane-controls').insertBefore(controlBar, sidePane.querySelector('.pane-controls').firstChild); }
  
  // Show loading indicator function
  function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      setTimeout(() => {
        loadingOverlay.classList.add('visible');
      }, 10);
    }
  }
  
  // Hide loading indicator function
  function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('visible');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 300);
    }
  }
  
  function openPane(){ 
    sidePane.classList.add('open'); 
    sidePane.setAttribute('aria-hidden','false'); 
    document.getElementById('appContainer').style.left = '320px';
    // Add animation class
    sidePane.classList.add('animate-in');
    setTimeout(() => {
      sidePane.classList.remove('animate-in');
    }, 300);
  }
  
  function closePaneFn(){ 
    sidePane.classList.add('animate-out');
    setTimeout(() => {
      sidePane.classList.remove('open', 'animate-out'); 
      sidePane.setAttribute('aria-hidden','true'); 
      document.getElementById('appContainer').style.left = '0';
    }, 300);
  }
  
  hamburgerBtn.addEventListener('click', ()=>{ 
    if(sidePane.classList.contains('open')) closePaneFn(); 
    else openPane(); 
  });
  
  closePane.addEventListener('click', closePaneFn);

    // date and location controls in side pane
    const paneDateInput = document.getElementById('paneDateInput');
    const applyDateBtn = document.getElementById('applyDateBtn');
    const paneLocationInput = document.getElementById('paneLocationInput');
    const applyLocationBtn = document.getElementById('applyLocationBtn');
    
    // Add event listeners for input focus effects
    document.querySelectorAll('.control-input').forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });
    });

    // initialize date input to current layer time if available
    (function(){ const t = nasaLayer.options.time || viirisLayer.options.time || blueLayer.options.time; if(t) paneDateInput.value = t; })();

    // store canonical template urls so we can substitute {time}
    const layerTemplates = {
      nasa: nasaLayer._url || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      viirs: viirisLayer._url || 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
      blue: blueLayer._url || 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
      viirsrgb: viirisrgbLayer._url || 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'
    };

    async function applyDateToLayerDateString(dateStr){ // dateStr in YYYY-MM-DD
      showLoading();
      const time = dateStr || (new Date()).toISOString().slice(0,10);
      try{
        if(nasaLayer){ const tpl = layerTemplates.nasa; if(tpl.indexOf('{time}')!==-1){ const newUrl = tpl.replace('{time}', time); nasaLayer.options.time = time; nasaLayer.setUrl(newUrl); } }
        if(viirisLayer){ const tpl = layerTemplates.viirs; if(tpl.indexOf('{time}')!==-1){ const newUrl = tpl.replace('{time}', time); viirisLayer.options.time = time; viirisLayer.setUrl(newUrl); } }
        if(blueLayer){ const tpl = layerTemplates.blue; if(tpl.indexOf('{time}')!==-1){ const newUrl = tpl.replace('{time}', time); blueLayer.options.time = time; blueLayer.setUrl(newUrl); } }
        if(viirisrgbLayer){ const tpl = layerTemplates.viirsrgb; if(tpl.indexOf('{time}')!==-1){ const newUrl = tpl.replace('{time}', time); viirisrgbLayer.options.time = time; viirisrgbLayer.setUrl(newUrl); } }
        
        // Show notification
        showNotification('Date updated to ' + time);
      }catch(e){ 
        console.warn('applyDate error', e);
        showNotification('Error updating date', 'error');
      }
      // apply to compare maps if present
      if(window.compareMaps && Array.isArray(window.compareMaps)){
        window.compareMaps.forEach(cm=>{
          cm.eachLayer(layer=>{
            try{ if(layer && layer._url && layer._url.indexOf('{time}')!==-1){ const newUrl = layer._url.replace('{time}', time); layer.options.time = time; layer.setUrl(newUrl); } }catch(e){}
          });
        });
      }
      
      setTimeout(() => {
        hideLoading();
      }, 500);
    }
    
    // Notification system
    function showNotification(message, type = 'success') {
      const notificationContainer = document.getElementById('notificationContainer');
      if (!notificationContainer) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        document.body.appendChild(container);
      }
      
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      document.getElementById('notificationContainer').appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }

    applyDateBtn.addEventListener('click', ()=>{ applyDateToLayerDateString(paneDateInput.value); });

    async function geocodeAndZoom(q){
      if(!q) return;
      showLoading();
      
      // if it's lat,lon
      const m = q.match(/^\s*([+-]?[0-9]+\.?[0-9]*)\s*,\s*([+-]?[0-9]+\.?[0-9]*)\s*$/);
      let lat, lon;
      if(m){ lat = parseFloat(m[1]); lon = parseFloat(m[2]); }
      else {
        try{
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`;
          const r = await fetch(url, { headers: { 'User-Agent': 'EarthVision/1.0' } });
          if(!r.ok) {
            hideLoading();
            showNotification('Location search failed', 'error');
            return;
          }
          const j = await r.json(); 
          if(j && j.length){ 
            lat = parseFloat(j[0].lat); 
            lon = parseFloat(j[0].lon);
            showNotification(`Location found: ${j[0].display_name}`);
          } else {
            hideLoading();
            showNotification('No location found', 'error');
            return;
          }
        }catch(e){ 
          console.warn('geocode error', e);
          hideLoading();
          showNotification('Error searching location', 'error');
          return;
        }
      }
      if(typeof lat === 'number' && typeof lon === 'number'){
        // compute a single target zoom level: prefer the main map zoom, but consider the first compare map if present
        let targetZoom = 3;
        try{ targetZoom = Math.max(3, Math.round(map.getZoom())); }catch(e){ targetZoom = 3; }
        if(window.compareMaps && Array.isArray(window.compareMaps) && window.compareMaps.length){
          try{ const z0 = Math.round(window.compareMaps[0].getZoom()); if(typeof z0 === 'number') targetZoom = Math.max(targetZoom, z0); }catch(e){}
        }
        // apply same center+zoom to main and all compare maps
        try{ 
          map.setView([lat, lon], targetZoom);
          // Add a pulsing marker at the location
          addPulsingMarker([lat, lon]);
        }catch(e){}
        if(window.compareMaps && Array.isArray(window.compareMaps)) window.compareMaps.forEach(cm=>{ try{ cm.setView([lat, lon], targetZoom); }catch(e){} });
      }
      
      setTimeout(() => {
        hideLoading();
      }, 500);
    }
    
    // Add a pulsing marker at a location
    function addPulsingMarker(latlng) {
      // Remove any existing pulsing markers
      map.eachLayer(layer => {
        if (layer._pulsingMarker) {
          map.removeLayer(layer);
        }
      });
      
      // Create a custom pulsing icon
      const pulsingIcon = L.divIcon({
        className: 'pulsing-marker',
        iconSize: [20, 20]
      });
      
      // Add the marker
      const marker = L.marker(latlng, {
        icon: pulsingIcon,
        zIndexOffset: 1000
      });
      marker._pulsingMarker = true;
      marker.addTo(map);
      
      // Remove the marker after animation completes
      setTimeout(() => {
        map.removeLayer(marker);
      }, 3000);
    }

    applyLocationBtn.addEventListener('click', ()=> geocodeAndZoom(paneLocationInput.value));
    paneLocationInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') geocodeAndZoom(paneLocationInput.value); });

    // Enforce minimum visible width of ~25 km (25000 meters)
    function enforceMinVisibleMeters(mapInstance){
      try{
        const bounds = mapInstance.getBounds();
        const w = bounds.getEast() - bounds.getWest();
        // approximate meters using container width method
        const center = bounds.getCenter();
        const left = L.latLng(center.lat, bounds.getWest());
        const right = L.latLng(center.lat, bounds.getEast());
        const meters = center.distanceTo(right);
        if(meters < 25000){ // zoomed in too far, zoom out one level
          const zl = mapInstance.getZoom();
          mapInstance.setZoom(zl - 1);
        }
      }catch(e){}
    }
    // attach to main map
    map.on('zoomend moveend', ()=> enforceMinVisibleMeters(map));

    // Compare grid logic: when Compare button is clicked, show 4 maps in a grid
    (function(){
      const compareBtn = document.getElementById('compareToggle');
      const compareGrid = document.getElementById('compareGrid');
      const closeCompare = document.getElementById('closeCompare');
      let compareMaps = null; // array of 4 Leaflet maps

      function createCompare() {
        // hide main single map
        document.getElementById('map').style.display = 'none';
        // show compare grid
        compareGrid.style.display = 'flex';

        // prepare options for new maps
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Define available layers
        const availableLayers = [
          { name: 'NASA Blue Marble', url: layerTemplates.nasa, time: nasaLayer.options.time },
          { name: 'VIIRS CityLight', url: layerTemplates.viirs, time: viirisLayer.options.time },
          { name: 'VIIRS RGB Layer', url: layerTemplates.viirsrgb, time: viirisrgbLayer.options.time },
          { name: 'Blue Marble', url: layerTemplates.blue, time: blueLayer.options.time }
        ];

        // Shuffle the layers to get random order
        const shuffledLayers = [...availableLayers].sort(() => Math.random() - 0.5);

        compareMaps = [];
        for(let i=0; i<4; i++){
          const cell = document.getElementById('cell-'+i);
          // Clear any existing content
          while (cell.firstChild) {
            if (!cell.firstChild.classList || !cell.firstChild.classList.contains('cell-label')) {
              cell.removeChild(cell.firstChild);
            } else {
              break;
            }
          }
          
          // Update cell label with layer name
          const cellLabel = cell.querySelector('.cell-label');
          if (cellLabel) {
            cellLabel.textContent = shuffledLayers[i].name;
          } else {
            const newLabel = document.createElement('div');
            newLabel.className = 'cell-label';
            newLabel.textContent = shuffledLayers[i].name;
            cell.appendChild(newLabel);
          }
          
          // create container element
          const container = document.createElement('div');
          container.className = 'compare-map-container';
          container.style.position = 'absolute'; 
          container.style.top = '0'; 
          container.style.left = '0'; 
          container.style.right = '0'; 
          container.style.bottom = '0'; 
          container.style.width = '100%'; 
          container.style.height = '100%';
          container.style.overflow = 'hidden';
          container.style.zIndex = '1';
          container.style.pointerEvents = 'auto';
          cell.appendChild(container);
          
          const m = L.map(container, { 
            center: [center.lat, center.lng], 
            zoom: zoom, 
            zoomControl: false,
            attributionControl: false
          });
          
          // Add the randomly selected layer to this map
          try {
            L.tileLayer(shuffledLayers[i].url, {time: shuffledLayers[i].time}).addTo(m);
          } catch(e){
            console.error('Error creating layer for compare view:', e);
          }

          // ensure interactions are enabled for compare maps
          try{ 
            m.dragging.enable(); 
            m.scrollWheelZoom.enable(); 
            m.touchZoom.enable(); 
            m.doubleClickZoom.enable(); 
            m.keyboard.enable(); 
          } catch(e){}

          compareMaps.push(m);
        }

        // expose for navigation module
        window.compareMaps = compareMaps;

  // notify listeners that compare maps are ready
  try{ window.dispatchEvent(new CustomEvent('compareMapsCreated', { detail: { compareMaps } })); }catch(e){}

        // enforce min visible meters on each compare map and if nav is active attach labels
        compareMaps.forEach(cm=>{
          cm.on('zoomend moveend', ()=> enforceMinVisibleMeters(cm));
          // ensure map sizes are correct after being added
          setTimeout(()=>{ try{ cm.invalidateSize(true); }catch(e){} }, 300);
        });

        // let the main map know layout changed
        setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} }, 350);

        // sync view: when one map moves/zooms, update others
        compareMaps.forEach((cm, idx)=>{
          cm.on('moveend zoomend', ()=>{
            const c = cm.getCenter(); const z = cm.getZoom();
            compareMaps.forEach((other, j)=>{ if(j===idx) return; other.setView(c, z); });
          });
        });
      }

      function destroyCompare(){
        if(!compareMaps) return;
        compareMaps.forEach((cm, idx)=>{
          try{ cm.off(); cm.remove(); }catch(e){}
          const cell = document.getElementById('cell-'+idx);
          cell.innerHTML = '';
        });
        compareMaps = null;
        compareGrid.style.display = 'none';
        document.getElementById('map').style.display = 'block';

        // re-invalidate sizes
        try{ map.invalidateSize(); }catch(e){}

        // clear exposed compare maps
        window.compareMaps = null;
        try{ window.dispatchEvent(new CustomEvent('compareMapsDestroyed')); }catch(e){}
      }

      compareBtn.addEventListener('click', ()=>{
        if(compareGrid.style.display==='block'){
          destroyCompare();
          compareBtn.classList.remove('active');
        } else {
          createCompare();
          compareBtn.classList.add('active');
        }
      });

      closeCompare.addEventListener('click', () => {
        destroyCompare();
        compareBtn.classList.remove('active');
      });
    })();

    // Navigation (hover reverse-geocode) module
    (function(){
      const navBtn = document.getElementById('navToggle');
    let navActive = false;
    // store remover functions per map id (keyed by map._leaflet_id)
    const navRemovers = new Map();

      function makeLabel(container){
        const el = document.createElement('div');
        el.className = 'nav-label';
        el.style.display = 'none';
        container.appendChild(el);
        return el;
      }

      function debounce(fn, wait){ let t; return function(...a){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), wait); }; }

      async function reverseGeo(lat, lon){
        // small in-memory cache keyed by rounded coordinates to 3 decimals (~100m)
        if(!window.__ev_geocache) window.__ev_geocache = new Map();
        const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
        if(window.__ev_geocache.has(key)) return window.__ev_geocache.get(key);
        try{
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
          const r = await fetch(url, { headers: { 'User-Agent': 'EarthVision/1.0' } });
          if(!r.ok) return null; const j = await r.json();
          const out = j.display_name || (j.address && Object.values(j.address).join(', ')) || null;
          window.__ev_geocache.set(key, out);
          // limit cache size
          if(window.__ev_geocache.size > 2000) {
            // drop oldest (simple approach)
            const it = window.__ev_geocache.keys(); window.__ev_geocache.delete(it.next().value);
          }
          return out;
        }catch(e){ return null; }
      }

      function attachMap(mapInstance){
        const container = mapInstance.getContainer();
        const label = makeLabel(container);
        const onMove = debounce(async function(e){
          let latlng = null;
          if(e && e.latlng) latlng = e.latlng;
          else {
            // try to compute from client coords
            const ev = e && (e.originalEvent || e);
            if(ev && typeof ev.clientX === 'number' && typeof ev.clientY === 'number'){
              const rect = container.getBoundingClientRect();
              const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
              try{ latlng = mapInstance.containerPointToLatLng([x, y]); }catch(err){}
            }
          }
          if(!latlng) return;
          // show immediate coords while we do reverse geocode
          label.textContent = `${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}`;
          const p = mapInstance.latLngToContainerPoint(latlng);
          // clamp position to container
          const rect = container.getBoundingClientRect();
          let x = p.x; let y = p.y;
          x = Math.max(8, Math.min(x, rect.width - 8));
          y = Math.max(8, Math.min(y, rect.height - 8));
          label.style.left = `${x}px`; label.style.top = `${y}px`; label.style.display = 'block';
          const name = await reverseGeo(latlng.lat, latlng.lng);
          if(name) label.textContent = name;
        }, 300);
        const onOut = ()=> label.style.display='none';
        mapInstance.on('mousemove', onMove); mapInstance.on('mouseout', onOut);
        // also handle touchmove for mobile
        mapInstance.on('touchmove', onMove);
        mapInstance.on('touchend', onOut);
        return ()=>{ mapInstance.off('mousemove', onMove); mapInstance.off('mouseout', onOut); mapInstance.off('touchmove', onMove); mapInstance.off('touchend', onOut); try{ label.remove(); }catch(e){} };
      }

      navBtn.addEventListener('click', ()=>{
        navActive = !navActive; navBtn.classList.toggle('active', navActive);
        if(navActive){
          // attach to main
          if(!navRemovers.has(map._leaflet_id)) navRemovers.set(map._leaflet_id, attachMap(map));
          // attach to existing compare maps
          if(window.compareMaps && Array.isArray(window.compareMaps)){
            window.compareMaps.forEach(cm=>{ if(!navRemovers.has(cm._leaflet_id)) navRemovers.set(cm._leaflet_id, attachMap(cm)); });
          }
        } else {
          // remove all nav listeners
          navRemovers.forEach(fn=>{ try{ fn(); }catch(e){} }); navRemovers.clear();
        }
      });

      // Listen for compare maps create/destroy events to attach/detach nav listeners
      window.addEventListener('compareMapsCreated', (ev)=>{
        const cmaps = ev && ev.detail && ev.detail.compareMaps;
        if(!cmaps) return;
        if(navActive){
          cmaps.forEach(cm=>{ if(!navRemovers.has(cm._leaflet_id)) navRemovers.set(cm._leaflet_id, attachMap(cm)); });
        }
      });
      window.addEventListener('compareMapsDestroyed', ()=>{
        // remove any compare map listeners but keep main if navActive
        const toRemove = [];
        navRemovers.forEach((fn, id)=>{
          // keep main map's remover
          if(id !== map._leaflet_id) toRemove.push(id);
        });
        toRemove.forEach(id=>{ const fn = navRemovers.get(id); try{ fn(); }catch(e){} navRemovers.delete(id); });
      });
      // when nav is toggled on, if compare maps already exist attach immediately
      // navBtn click handler already handles attaching, but ensure if compare maps already exist we attach them too
    })();