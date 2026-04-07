'use strict';
/**
 * mockData.js – Almacén centralizado de datos para Terra Sky
 * Todas las páginas comparten la misma fuente de datos.
 * Los cambios se persisten en sessionStorage automáticamente.
 */
(function (glob) {

  /* ════════════════════════════════════════════════════════════
     AEROPUERTOS
     ════════════════════════════════════════════════════════════ */
  var AEROPUERTOS = [
    { code: 'BOG', city: 'Bogotá',      country: 'Colombia',   name: 'El Dorado' },
    { code: 'MDE', city: 'Medellín',     country: 'Colombia',   name: 'José María Córdova' },
    { code: 'CLO', city: 'Cali',         country: 'Colombia',   name: 'Alfonso Bonilla Aragón' },
    { code: 'CTG', city: 'Cartagena',    country: 'Colombia',   name: 'Rafael Núñez' },
    { code: 'BAQ', city: 'Barranquilla', country: 'Colombia',   name: 'Ernesto Cortissoz' },
    { code: 'SMR', city: 'Santa Marta',  country: 'Colombia',   name: 'Simón Bolívar' },
    { code: 'BGA', city: 'Bucaramanga',  country: 'Colombia',   name: 'Palonegro' },
    { code: 'PEI', city: 'Pereira',      country: 'Colombia',   name: 'Matecaña' },
    { code: 'ADZ', city: 'San Andrés',   country: 'Colombia',   name: 'Gustavo Rojas Pinilla' },
    { code: 'MAD', city: 'Madrid',       country: 'España',     name: 'Adolfo Suárez Madrid-Barajas' },
    { code: 'BCN', city: 'Barcelona',    country: 'España',     name: 'El Prat' },
    { code: 'JFK', city: 'Nueva York',   country: 'Estados Unidos', name: 'John F. Kennedy' },
    { code: 'MIA', city: 'Miami',        country: 'Estados Unidos', name: 'Miami International' },
    { code: 'CDG', city: 'París',        country: 'Francia',    name: 'Charles de Gaulle' },
    { code: 'GRU', city: 'São Paulo',    country: 'Brasil',     name: 'Guarulhos' },
    { code: 'MEX', city: 'Ciudad de México', country: 'México', name: 'Benito Juárez' },
    { code: 'SCL', city: 'Santiago',     country: 'Chile',      name: 'Arturo Merino Benítez' },
    { code: 'LIM', city: 'Lima',         country: 'Perú',       name: 'Jorge Chávez' },
    { code: 'EZE', city: 'Buenos Aires', country: 'Argentina',  name: 'Ezeiza' },
    { code: 'CUN', city: 'Cancún',       country: 'México',     name: 'Cancún International' }
  ];

  var AIRPORT_MAP = {};
  AEROPUERTOS.forEach(function (a) { AIRPORT_MAP[a.code] = a; });

  /* ════════════════════════════════════════════════════════════
     VUELOS BASE
     ════════════════════════════════════════════════════════════ */
  var VUELOS_BASE = [
    { id: 1,  code: 'AN1001', origin: 'BOG', dest: 'MDE', dep: '06:00', arr: '07:10', dur: '1h 10m',  stops: 0, price: 185000,  cabin: 'Económica',      aircraft: 'Airbus A320',  seats: 48, amenities: ['WiFi','Equipaje 23kg'] },
    { id: 2,  code: 'AN1005', origin: 'BOG', dest: 'MDE', dep: '12:30', arr: '13:40', dur: '1h 10m',  stops: 0, price: 210000,  cabin: 'Económica Plus', aircraft: 'Airbus A320',  seats: 20, amenities: ['WiFi','Equipaje 23kg','Comida a bordo'] },
    { id: 3,  code: 'AN1009', origin: 'BOG', dest: 'CTG', dep: '08:00', arr: '09:20', dur: '1h 20m',  stops: 0, price: 255000,  cabin: 'Económica',      aircraft: 'Boeing 737',   seats: 55, amenities: ['Equipaje 15kg'] },
    { id: 4,  code: 'AN1015', origin: 'BOG', dest: 'CLO', dep: '07:00', arr: '07:55', dur: '55m',     stops: 0, price: 180000,  cabin: 'Económica',      aircraft: 'Airbus A320',  seats: 42, amenities: ['WiFi','Equipaje 23kg'] },
    { id: 5,  code: 'AN2001', origin: 'BOG', dest: 'MAD', dep: '23:45', arr: '15:20', dur: '10h 35m', stops: 0, price: 2890000, cabin: 'Económica',      aircraft: 'Boeing 787',   seats: 12, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 6,  code: 'AN2005', origin: 'BOG', dest: 'MAD', dep: '22:00', arr: '12:30', dur: '9h 30m',  stops: 1, price: 2600000, cabin: 'Económica',      aircraft: 'Airbus A350',  seats: 28, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 7,  code: 'AN2010', origin: 'BOG', dest: 'MAD', dep: '10:00', arr: '08:30', dur: '9h 30m',  stops: 0, price: 5200000, cabin: 'Ejecutiva',      aircraft: 'Boeing 787',   seats: 6,  amenities: ['WiFi','Comida gourmet','Equipaje 32kg','Lounge VIP'] },
    { id: 8,  code: 'AN3001', origin: 'BOG', dest: 'BCN', dep: '23:00', arr: '16:30', dur: '10h 30m', stops: 1, price: 2870000, cabin: 'Económica',      aircraft: 'Airbus A350',  seats: 18, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 9,  code: 'AN4001', origin: 'BOG', dest: 'JFK', dep: '22:30', arr: '06:45', dur: '7h 15m',  stops: 0, price: 2980000, cabin: 'Económica',      aircraft: 'Boeing 787',   seats: 22, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 10, code: 'AN4006', origin: 'BOG', dest: 'JFK', dep: '10:00', arr: '18:00', dur: '7h 00m',  stops: 1, price: 2750000, cabin: 'Económica Plus', aircraft: 'Boeing 777',   seats: 10, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 11, code: 'AN5001', origin: 'BOG', dest: 'MIA', dep: '08:00', arr: '13:30', dur: '5h 30m',  stops: 0, price: 1850000, cabin: 'Económica',      aircraft: 'Boeing 737',   seats: 30, amenities: ['WiFi','Equipaje 23kg'] },
    { id: 12, code: 'AN5005', origin: 'BOG', dest: 'MIA', dep: '14:00', arr: '21:00', dur: '6h 00m',  stops: 1, price: 1650000, cabin: 'Económica',      aircraft: 'Airbus A320',  seats: 35, amenities: ['Equipaje 15kg'] },
    { id: 13, code: 'AN6001', origin: 'MDE', dest: 'BOG', dep: '15:00', arr: '16:10', dur: '1h 10m',  stops: 0, price: 195000,  cabin: 'Económica',      aircraft: 'Airbus A320',  seats: 38, amenities: ['WiFi','Equipaje 23kg'] },
    { id: 14, code: 'AN6010', origin: 'CTG', dest: 'BOG', dep: '17:30', arr: '18:50', dur: '1h 20m',  stops: 0, price: 245000,  cabin: 'Económica',      aircraft: 'Boeing 737',   seats: 50, amenities: ['Equipaje 15kg'] },
    { id: 15, code: 'AN7001', origin: 'BOG', dest: 'CDG', dep: '21:00', arr: '14:30', dur: '11h 30m', stops: 0, price: 3250000, cabin: 'Económica',      aircraft: 'Airbus A350',  seats: 15, amenities: ['WiFi','Comida a bordo','Equipaje 23kg'] },
    { id: 16, code: 'AN8001', origin: 'BOG', dest: 'LIM', dep: '09:30', arr: '12:15', dur: '2h 45m',  stops: 0, price: 680000,  cabin: 'Económica',      aircraft: 'Airbus A320',  seats: 40, amenities: ['WiFi','Equipaje 23kg'] }
  ];

  /* ════════════════════════════════════════════════════════════
     ESTADO DE VUELOS (para estado.html)
     ════════════════════════════════════════════════════════════ */
  var ESTADO_VUELOS = {
    'TS-152':  { origin:'BOG', dest:'MAD', originCity:'Bogotá',    destCity:'Madrid',     dep:'22:30', arr:'14:15', duration:'11h 45min', status:'ontime',   statusText:'A tiempo',        progress:0,   terminal:'T1', gate:'B12', boarding:'21:45', aircraft:'A330-200', date:'15 Mar 2026', planePos:'En tierra · En preparación' },
    'TS-241':  { origin:'MDE', dest:'BCN', originCity:'Medellín',  destCity:'Barcelona',  dep:'14:10', arr:'08:30', duration:'12h 20min', status:'boarding', statusText:'Embarcando',       progress:5,   terminal:'T2', gate:'A05', boarding:'13:30', aircraft:'B787-9',   date:'22 Mar 2026', planePos:'Embarque en progreso' },
    'TS-378':  { origin:'CLO', dest:'JFK', originCity:'Cali',      destCity:'Nueva York', dep:'09:45', arr:'19:20', duration:'9h 35min',  status:'delayed',  statusText:'Demorado 25min',  progress:0,   terminal:'T1', gate:'C21', boarding:'10:05', aircraft:'B737-MAX', date:'28 Mar 2026', planePos:'En tierra · Demorado por clima', newDep:'10:10', newArr:'19:45' },
    'TS-090':  { origin:'BOG', dest:'MDE', originCity:'Bogotá',    destCity:'Medellín',   dep:'06:15', arr:'07:05', duration:'50min',     status:'arrived',  statusText:'Aterrizó',        progress:100, terminal:'T1', gate:'D03', boarding:'05:45', aircraft:'A320neo',  date:'Hoy',         planePos:'Aterrizó a las 07:02' },
    'TS-305':  { origin:'CTG', dest:'BOG', originCity:'Cartagena', destCity:'Bogotá',     dep:'11:30', arr:'12:20', duration:'50min',     status:'ontime',   statusText:'A tiempo',        progress:0,   terminal:'T1', gate:'E08', boarding:'11:00', aircraft:'A320neo',  date:'Hoy',         planePos:'En tierra · Abordará pronto' },
    'TS-412':  { origin:'BOG', dest:'MIA', originCity:'Bogotá',    destCity:'Miami',      dep:'15:55', arr:'20:45', duration:'4h 50min',  status:'ontime',   statusText:'A tiempo',        progress:0,   terminal:'T1', gate:'F14', boarding:'15:20', aircraft:'B737-MAX', date:'Hoy',         planePos:'En tierra · En preparación' }
  };

  /* ════════════════════════════════════════════════════════════
     RESERVAS – Persistencia en sessionStorage
     ════════════════════════════════════════════════════════════ */
  var RESERVAS_KEY = 'ts_reservas';

  var RESERVAS_DEFAULT = [
    {
      code: 'TS-BOG001', flightCode: 'TS-152',
      passenger: 'Carlos Andrés Ramírez López',
      firstName: 'Carlos Andrés', lastName: 'Ramírez',
      email: 'carlos.ramirez@email.com', phone: '+57 310 456 7890',
      docType: 'Cédula de ciudadanía', docNumber: '1012345678',
      origin: 'BOG', dest: 'MAD', originCity: 'Bogotá', destCity: 'Madrid',
      dep: '22:30', arr: '14:15', date: '15 Mar 2026', dateShort: '15 MAR',
      duration: '11h 45min', stops: 'Directo',
      cabin: 'Económica', seat: '14A', gate: 'B12',
      aircraft: 'A330-200',
      estado: 'Confirmada', checkedIn: false,
      passengers: { count: 1 },
      basePrice: 850000, taxes: 152000, total: 1002000,
      createdAt: '2026-02-28T10:00:00Z'
    },
    {
      code: 'TS-MDE002', flightCode: 'TS-241',
      passenger: 'María Isabel Gómez Vargas',
      firstName: 'María Isabel', lastName: 'Gómez',
      email: 'maria.gomez@email.com', phone: '+57 300 123 4567',
      docType: 'Cédula de ciudadanía', docNumber: '1098765432',
      origin: 'MDE', dest: 'BCN', originCity: 'Medellín', destCity: 'Barcelona',
      dep: '14:10', arr: '08:30', date: '22 Mar 2026', dateShort: '22 MAR',
      duration: '12h 20min', stops: 'Directo',
      cabin: 'Ejecutiva', seat: '2C', gate: 'A05',
      aircraft: 'B787-9',
      estado: 'Confirmada', checkedIn: false,
      passengers: { count: 1 },
      basePrice: 3150000, taxes: 300000, total: 3450000,
      createdAt: '2026-03-01T14:30:00Z'
    },
    {
      code: 'TS-CLO003', flightCode: 'TS-378',
      passenger: 'Andrés Felipe Martínez Ortiz',
      firstName: 'Andrés Felipe', lastName: 'Martínez',
      email: 'andres.martinez@email.com', phone: '+57 305 789 0123',
      docType: 'Pasaporte', docNumber: 'AZ123456',
      origin: 'CLO', dest: 'JFK', originCity: 'Cali', destCity: 'Nueva York',
      dep: '09:45', arr: '19:20', date: '28 Mar 2026', dateShort: '28 MAR',
      duration: '9h 35min', stops: 'Directo',
      cabin: 'Económica', seat: '28B', gate: 'C21',
      aircraft: 'B737-MAX',
      estado: 'Confirmada', checkedIn: false,
      passengers: { count: 1 },
      basePrice: 1350000, taxes: 170000, total: 1520000,
      createdAt: '2026-03-05T09:15:00Z'
    }
  ];

  function getReservas() {
    try {
      var raw = sessionStorage.getItem(RESERVAS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fallback */ }
    // No existe aún: inicializar con datos por defecto
    sessionStorage.setItem(RESERVAS_KEY, JSON.stringify(RESERVAS_DEFAULT));
    return JSON.parse(JSON.stringify(RESERVAS_DEFAULT));
  }

  function saveReservas(reservas) {
    sessionStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));
  }

  function findReserva(code) {
    var reservas = getReservas();
    code = (code || '').toUpperCase();
    for (var i = 0; i < reservas.length; i++) {
      if (reservas[i].code === code) return reservas[i];
    }
    return null;
  }

  function findReservaByCodeAndLastName(code, lastName) {
    var reservas = getReservas();
    code = (code || '').toUpperCase();
    var normLast = normalize(lastName);
    for (var i = 0; i < reservas.length; i++) {
      var r = reservas[i];
      if (r.code === code && normalize(r.lastName) === normLast) return r;
    }
    return null;
  }

  function addReserva(reserva) {
    var reservas = getReservas();
    reservas.push(reserva);
    saveReservas(reservas);
    return reserva;
  }

  function updateReserva(code, updates) {
    var reservas = getReservas();
    code = (code || '').toUpperCase();
    for (var i = 0; i < reservas.length; i++) {
      if (reservas[i].code === code) {
        for (var k in updates) {
          if (updates.hasOwnProperty(k)) reservas[i][k] = updates[k];
        }
        saveReservas(reservas);
        return reservas[i];
      }
    }
    return null;
  }

  function generateBookingCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = 'TS-';
    for (var i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /* ════════════════════════════════════════════════════════════
     HISTORIAL DE VIAJES (solo lectura)
     ════════════════════════════════════════════════════════════ */
  var HISTORIAL = [
    { ruta: 'BOG → CTG', codigo: 'TS-890', fecha: '10 Ene 2026', duracion: '1h 20m', estrellas: 5 },
    { ruta: 'CTG → BOG', codigo: 'TS-891', fecha: '15 Ene 2026', duracion: '1h 20m', estrellas: 4 },
    { ruta: 'BOG → MDE', codigo: 'TS-456', fecha: '28 Dic 2025', duracion: '1h 10m', estrellas: 5 },
    { ruta: 'MDE → BOG', codigo: 'TS-457', fecha: '02 Ene 2026', duracion: '1h 10m', estrellas: 4 }
  ];

  /* ════════════════════════════════════════════════════════════
     DATOS PARA DASHBOARDS
     ════════════════════════════════════════════════════════════ */
  var DASHBOARD_STATS = {
    cliente: {
      millasTotales: 45680,
      millasNivel: 'Gold',
      millasPorcentaje: 68,
      millasFaltantes: 4320,
      millasAcumuladas: 12450,
      millasCanjeadas: 8200
    },
    agente: {
      pendientes: [
        { cliente: 'Laura García', codigo: 'TS-PEN001', vuelo: 'AN1001 BOG→MDE', valor: 185000, estado: 'Pendiente' },
        { cliente: 'Diego Torres', codigo: 'TS-PEN002', vuelo: 'AN2001 BOG→MAD', valor: 2890000, estado: 'Pendiente' },
        { cliente: 'Sofia Hernández', codigo: 'TS-PEN003', vuelo: 'AN4001 BOG→JFK', valor: 2980000, estado: 'Pendiente' }
      ],
      vuelosActivos: [
        { codigo: 'TS-152', ruta: 'BOG → MAD', hora: '22:30 - 14:15 (+1)', aeronave: 'A330-200', estado: 'Programado' },
        { codigo: 'TS-241', ruta: 'MDE → BCN', hora: '14:10 - 08:30 (+1)', aeronave: 'B787-9',   estado: 'En vuelo' },
        { codigo: 'TS-090', ruta: 'BOG → MDE', hora: '06:15 - 07:05',      aeronave: 'A320neo',  estado: 'En vuelo' }
      ]
    }
  };

  /* ════════════════════════════════════════════════════════════
     CATÁLOGO COMERCIAL (ofertas, destinos, paquetes)
     Módulo unificado — cada item tiene un "tipo" que lo clasifica.
     ════════════════════════════════════════════════════════════ */
  var CATALOGO_COMERCIAL = [
    // ── OFERTAS (descuentos directos en vuelos) ──
    {
      id: 'of-01', tipo: 'oferta', destacado: true, orden: 1,
      titulo: 'Vuelos nacionales', subtitulo: 'Bogotá · Medellín · Cali',
      descripcion: 'Tarifas especiales en rutas nacionales con equipaje incluido.',
      etiqueta: 'Oferta especial',
      precio: 89000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'MDE',
      imagen: 'https://images.unsplash.com/photo-1640768239887-77479f49a7dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: 'verde', tipo_badge: 'Nacional',
      incluye: null, estrellas: null, vigencia: '2026-06-30'
    },
    {
      id: 'of-02', tipo: 'oferta', destacado: true, orden: 2,
      titulo: 'Nueva York – JFK', subtitulo: 'Clase ejecutiva disponible',
      descripcion: 'Vuela en temporada alta con las mejores tarifas internacionales.',
      etiqueta: 'Temporada alta',
      precio: 4980000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'JFK',
      imagen: 'https://images.unsplash.com/photo-1644530777878-f576db6ac8ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: 'dark', tipo_badge: 'Internacional',
      incluye: null, estrellas: null, vigencia: '2026-12-31'
    },
    {
      id: 'of-03', tipo: 'oferta', destacado: false, orden: 5,
      titulo: 'Cali ida y vuelta', subtitulo: 'Salsa, gastronomía y naturaleza',
      descripcion: 'Descubre el Pacífico colombiano a un precio increíble.',
      etiqueta: 'Precio especial',
      precio: 180000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'CLO',
      imagen: 'https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/2018/06/CO_X-lugares-turi%CC%81sticos-de-Cali-que-te-dejara%CC%81n-sin-palabras.jpg',
      color: 'cyan', tipo_badge: 'Nacional',
      incluye: null, estrellas: null, vigencia: '2026-09-30'
    },
    // ── DESTINOS (tarjetas de exploración) ──
    {
      id: 'ds-01', tipo: 'destino', destacado: true, orden: 3,
      titulo: 'Madrid', subtitulo: 'España',
      descripcion: 'La vibrante capital española: arte, tapas y vida nocturna.',
      etiqueta: null,
      precio: 2890000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'MAD',
      imagen: 'https://images.unsplash.com/photo-1612694882907-80f21c0e2bb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Internacional',
      popular: true, incluye: null, estrellas: null, vigencia: null
    },
    {
      id: 'ds-02', tipo: 'destino', destacado: false, orden: 6,
      titulo: 'Barcelona', subtitulo: 'España',
      descripcion: 'Gaudí, playa y cocina mediterránea en la joya de Cataluña.',
      etiqueta: null,
      precio: 2870000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'BCN',
      imagen: 'https://images.unsplash.com/photo-1691732758999-40e14a08a66a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Internacional',
      popular: false, incluye: null, estrellas: null, vigencia: null
    },
    {
      id: 'ds-03', tipo: 'destino', destacado: false, orden: 7,
      titulo: 'Cartagena', subtitulo: 'Colombia',
      descripcion: 'Ciudad amurallada, playas paradisíacas y brisa caribeña.',
      etiqueta: null,
      precio: 250000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'CTG',
      imagen: 'https://images.unsplash.com/photo-1692839685082-c66d810f0a21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Nacional',
      popular: false, incluye: null, estrellas: null, vigencia: null
    },
    {
      id: 'ds-04', tipo: 'destino', destacado: false, orden: 8,
      titulo: 'Medellín', subtitulo: 'Colombia',
      descripcion: 'La ciudad de la eterna primavera: innovación y naturaleza.',
      etiqueta: null,
      precio: 160000, precioOriginal: null, descuento: null,
      origen: 'BOG', destino: 'MDE',
      imagen: 'https://images.unsplash.com/photo-1640768239887-77479f49a7dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Nacional',
      popular: true, incluye: null, estrellas: null, vigencia: null
    },
    // ── PAQUETES (vuelo + hotel + servicios) ──
    {
      id: 'pk-01', tipo: 'paquete', destacado: true, orden: 4,
      titulo: 'Cartagena Express', subtitulo: 'Vuelo + 3 noches hotel + traslados',
      descripcion: 'Escapada perfecta al Caribe colombiano con todo incluido.',
      etiqueta: 'Más vendido',
      precio: 920000, precioOriginal: 1280000, descuento: 28,
      origen: 'BOG', destino: 'CTG',
      imagen: 'https://images.unsplash.com/photo-1621944860377-8cfda325a59e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Nacional',
      incluye: ['Vuelo ida y vuelta', 'Hotel 4★ céntrico', 'Traslado aeropuerto', 'Desayuno incluido'],
      estrellas: 4, vigencia: '2026-08-31'
    },
    {
      id: 'pk-02', tipo: 'paquete', destacado: true, orden: 4,
      titulo: 'Clase Ejecutiva Madrid', subtitulo: 'Vuelo ejecutiva + hotel boutique 5★',
      descripcion: 'Experiencia premium en la capital española sin preocupaciones.',
      etiqueta: 'Premium',
      precio: 8100000, precioOriginal: 10800000, descuento: 25,
      origen: 'BOG', destino: 'MAD',
      imagen: 'https://images.unsplash.com/photo-1772354852092-0685c2bf32b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Internacional',
      incluye: ['Ejecutiva ida y vuelta', 'Hotel 5★ Madrid centro', 'Acceso Lounge VIP', 'Traslado privado'],
      estrellas: 5, vigencia: '2026-12-31'
    },
    {
      id: 'pk-03', tipo: 'paquete', destacado: false, orden: 9,
      titulo: 'Barcelona Cultural', subtitulo: 'Vuelo + 5 noches + tour Gaudí',
      descripcion: 'Descubre la arquitectura modernista con un paquete completo.',
      etiqueta: 'Nuevo',
      precio: 6750000, precioOriginal: 8500000, descuento: 21,
      origen: 'BOG', destino: 'BCN',
      imagen: 'https://images.unsplash.com/photo-1691732758999-40e14a08a66a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      color: null, tipo_badge: 'Internacional',
      incluye: ['Vuelo ida y vuelta', 'Hotel 4★ Las Ramblas', 'Tour Gaudí guiado', 'Seguro de viaje'],
      estrellas: 4, vigencia: '2026-10-15'
    }
  ];

  function getCatalogo(filtro) {
    var items = CATALOGO_COMERCIAL.slice();
    if (filtro && filtro !== 'todos') {
      items = items.filter(function (i) { return i.tipo === filtro; });
    }
    items.sort(function (a, b) { return a.orden - b.orden; });
    return items;
  }

  /* ════════════════════════════════════════════════════════════
     HELPERS
     ════════════════════════════════════════════════════════════ */
  function normalize(str) {
    return (str || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function formatCOP(n) {
    try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n); }
    catch (e) { return 'COP ' + String(n); }
  }

  function airportLabel(code) {
    var a = AIRPORT_MAP[code];
    return a ? a.city + ' (' + code + ')' : code;
  }

  function filterAirports(query) {
    if (!query || query.length < 1) return [];
    var q = normalize(query);
    return AEROPUERTOS.filter(function (a) {
      return normalize(a.code).indexOf(q) !== -1 ||
             normalize(a.city).indexOf(q) !== -1 ||
             normalize(a.name).indexOf(q) !== -1 ||
             normalize(a.country).indexOf(q) !== -1;
    }).slice(0, 8);
  }

  function findFlight(code) {
    code = (code || '').toUpperCase();
    for (var i = 0; i < VUELOS_BASE.length; i++) {
      if (VUELOS_BASE[i].code === code) return VUELOS_BASE[i];
    }
    return null;
  }

  /* ════════════════════════════════════════════════════════════
     EXPORTAR
     ════════════════════════════════════════════════════════════ */
  glob.TSData = {
    // Datos estáticos
    AEROPUERTOS: AEROPUERTOS,
    AIRPORT_MAP: AIRPORT_MAP,
    VUELOS: VUELOS_BASE,
    ESTADO_VUELOS: ESTADO_VUELOS,
    HISTORIAL: HISTORIAL,
    DASHBOARD_STATS: DASHBOARD_STATS,
    CATALOGO: CATALOGO_COMERCIAL,

    // Reservas con persistencia
    getReservas: getReservas,
    saveReservas: saveReservas,
    findReserva: findReserva,
    findReservaByCodeAndLastName: findReservaByCodeAndLastName,
    addReserva: addReserva,
    updateReserva: updateReserva,
    generateBookingCode: generateBookingCode,

    // Catálogo comercial
    getCatalogo: getCatalogo,

    // Helpers
    normalize: normalize,
    formatCOP: formatCOP,
    airportLabel: airportLabel,
    filterAirports: filterAirports,
    findFlight: findFlight
  };

})(window);
