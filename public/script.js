// public/script.js

// 1. Usuario logueado
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'login.html';
}

// 2. Inicializar mapa
const map = L.map('map').setView([21.15, -101.68], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let tempMarker = null;      // marcador temporal al hacer click
let markers = {};           // marcadores por _id
let editingId = null;

// Click en el mapa → seleccionar coordenadas
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  document.getElementById('lat').value = lat;
  document.getElementById('lng').value = lng;

  if (tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup('Ubicación seleccionada').openPopup();
});

// 3. Enviar formulario (crear o actualizar)
document.getElementById('place-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);

  if (!lat || !lng) {
    alert('Selecciona una ubicación en el mapa');
    return;
  }

  const body = {
    name,
    description,
    userId: user._id,
    location: { coordinates: [lng, lat] }
  };

  try {
    let url = '/places';
    let method = 'POST';

    if (editingId) {
      url = `/places/${editingId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al guardar');
    }

    await res.json();
    alert(editingId ? 'Ubicación actualizada' : 'Ubicación guardada');
    resetForm();
    await loadPlaces();
  } catch (err) {
    alert(err.message);
  }
});

// Botón cancelar
document.getElementById('cancel-btn').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('place-form').reset();
  document.getElementById('lat').value = '';
  document.getElementById('lng').value = '';
  editingId = null;
  document.getElementById('submit-btn').textContent = 'Agregar lugar';
  document.getElementById('cancel-btn').style.display = 'none';

  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
}

// 4. Cargar lugares + tabla
async function loadPlaces() {
  const searchName = document.getElementById('search-name')?.value || '';
  const url = `/places?userId=${user._id}&name=${encodeURIComponent(searchName)}`;
  const res = await fetch(url);
  const places = await res.json();

  // limpiar marcadores y tabla
  Object.values(markers).forEach((m) => map.removeLayer(m));
  markers = {};
  const tbody = document.getElementById('places-tbody');
  if (tbody) tbody.innerHTML = '';

  places.forEach((place) => {
    const [lng, lat] = place.location.coordinates;

    // marcador con popup (editar / eliminar)
    const popupHtml = `
      <b>${place.name}</b><br>
      ${place.description}<br>
      <button onclick="editPlace('${place._id}')" style="margin-top:5px;">Editar</button>
      <button onclick="deletePlace('${place._id}')" style="margin-top:5px; margin-left:4px;">Eliminar</button>
    `;

    const marker = L.marker([lat, lng]).addTo(map).bindPopup(popupHtml);
    markers[place._id] = marker;

    // fila en tabla
    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${place.name}</td>
        <td>${place.description}</td>
        <td>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// 5. Filtro de búsqueda por nombre
const searchBtn = document.getElementById('search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', loadPlaces);
}

// 6. Funciones globales para popup (editar, borrar)
window.editPlace = async function(id) {
  try {
    const res = await fetch(`/places/${id}`);
    if (!res.ok) throw new Error('No se pudo cargar la ubicación');
    const place = await res.json();
    const [lng, lat] = place.location.coordinates;

    editingId = place._id;
    document.getElementById('name').value = place.name;
    document.getElementById('description').value = place.description;
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    document.getElementById('submit-btn').textContent = 'Actualizar lugar';
    document.getElementById('cancel-btn').style.display = 'inline-block';

    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker([lat, lng]).addTo(map).bindPopup('Editando ubicación').openPopup();
    map.setView([lat, lng], 16);
  } catch (err) {
    alert(err.message);
  }
};

window.deletePlace = async function(id) {
  if (!confirm('¿Eliminar esta ubicación?')) return;

  try {
    const res = await fetch(`/places/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar');
    await res.json();
    alert('Ubicación eliminada');
    await loadPlaces();
  } catch (err) {
    alert(err.message);
  }
};

// 7. Cargar lugares al inicio
loadPlaces();

// Control de dibujo
const drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false,
      polygon: {
        allowIntersection: false,
        showArea: true
      }
    },
    edit: false
  });
  map.addControl(drawControl);
  
  map.on(L.Draw.Event.CREATED, async function (e) {
    const layer = e.layer;
    if (e.layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0]; // primer anillo
      const coords = latlngs.map(p => [p.lng, p.lat]); // [ [lng,lat], ... ]
  
      const name = prompt('Nombre de la zona:');
      if (!name) return;
  
      await fetch('/polygons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: '',
          userId: user._id,
          coordinates: [coords]  // [[ [lng,lat]... ]]
        })
      });
  
      layer.addTo(map);
      alert('Zona guardada');
    }
  });