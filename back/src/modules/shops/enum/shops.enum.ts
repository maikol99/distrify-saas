export enum ShopsPaymentStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum ShopPlanEnum {
  FREE = 'FREE',
  BASIC = 'BASIC',
  MEDIUM = 'MEDIUM',
  PREMIUM = 'PREMIUM',
}

export enum ShopStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  PENDING = 'pending',
  DELETED = 'deleted',
  DEMO = 'demo',
}

export enum ShopsProvincesEnum {
  BUENOS_AIRES = 'Buenos Aires',
  CATAMARCA = 'Catamarca',
  CHACO = 'Chaco',
  CHUBUT = 'Chubut',
  CORDOBA = 'Córdoba',
  CORRIENTES = 'Corrientes',
  ENTRE_RIOS = 'Entre Ríos',
  FORMOSA = 'Formosa',
  JUJUY = 'Jujuy',
  LA_PAMPA = 'La Pampa',
  LA_RIOJA = 'La Rioja',
  MENDOZA = 'Mendoza',
  MISIONES = 'Misiones',
  NEUQUEN = 'Neuquén',
  RIO_NEGRO = 'Río Negro',
  SALTA = 'Salta',
  SAN_JUAN = 'San Juan',
  SAN_LUIS = 'San Luis',
  SANTA_CRUZ = 'Santa Cruz',
  SANTA_FE = 'Santa Fe',
  SANTIAGO_DEL_ESTERO = 'Santiago del Estero',
  TIERRA_DEL_FUEGO = 'Tierra del Fuego',
  TUCUMAN = 'Tucumán',
}

export enum ShopsCategoriesEnum {
  // 🔹 **Alimentos y Bebidas**
  RESTAURANTE = 'Restaurante',
  BAR_PUB = 'Bar/Pub',
  CAFE = 'Cafetería',
  PANADERIA = 'Panadería',
  PASTELERIA = 'Pastelería',
  CERVECERIA_ARTESANAL = 'Cervecería Artesanal',
  VINOTECA = 'Vinoteca',
  COMIDA_RAPIDA = 'Comida Rápida',
  SUPERMERCADO = 'Supermercado',
  ALMACEN = 'Almacén/Tienda de Barrio',
  DISTRIBUIDORA_ALIMENTOS = 'Distribuidora de Alimentos',
  HELADERIA = 'Heladería',

  // 🔹 **Salud y Bienestar**
  FARMACIA = 'Farmacia',
  HOSPITAL_CLINICA = 'Hospital/Clínica',
  ODONTOLOGIA = 'Odontología',
  OPTICA = 'Óptica',
  GIMNASIO = 'Gimnasio',
  SPA = 'Spa y Bienestar',
  PELUQUERIA = 'Peluquería',
  CENTRO_ESTETICA = 'Centro de Estética',
  MASAJISTA = 'Masajista',
  TERAPIA_ALTERNATIVA = 'Terapia Alternativa',

  // 🔹 **Moda y Belleza**
  TIENDA_ROPA = 'Tienda de Ropa',
  TIENDA_CALZADO = 'Tienda de Calzado',
  JOYERIA = 'Joyería y Relojería',
  TIENDA_ACCESORIOS = 'Tienda de Accesorios',
  INDUMENTARIA_DEPORTIVA = 'Indumentaria Deportiva',

  // 🔹 **Tecnología y Electrónica**
  TIENDA_ELECTRONICA = 'Tienda de Electrónica',
  SERVICIO_TECNICO = 'Servicio Técnico',
  DESARROLLO_SOFTWARE = 'Desarrollo de Software',
  CIBERCAFE = 'Cibercafé',
  TIENDA_GAMING = 'Tienda de Gaming',

  // 🔹 **Educación y Formación**
  ESCUELA = 'Escuela',
  UNIVERSIDAD = 'Universidad',
  ACADEMIA_IDIOMAS = 'Academia de Idiomas',
  CENTRO_CAPACITACION = 'Centro de Capacitación',
  LIBRERIA = 'Librería',
  BIBLIOTECA = 'Biblioteca',

  // 🔹 **Automotriz y Transporte**
  CONCESIONARIA = 'Concesionaria de Autos',
  TALLER_MECANICO = 'Taller Mecánico',
  RENT_A_CAR = 'Alquiler de Autos',
  TRANSPORTE_CARGA = 'Transporte de Carga',
  TRANSPORTE_PASAJEROS = 'Transporte de Pasajeros',
  LAVADERO_AUTOS = 'Lavadero de Autos',
  REPUESTOS_AUTOMOTRICES = 'Repuestos Automotrices',

  // 🔹 **Construcción e Inmobiliaria**
  INMOBILIARIA = 'Inmobiliaria',
  CONSTRUCCION = 'Empresa de Construcción',
  ARQUITECTURA = 'Estudio de Arquitectura',
  MATERIALES_CONSTRUCCION = 'Venta de Materiales de Construcción',
  FERRETERIA = 'Ferretería',
  CARPINTERIA = 'Carpintería',

  // 🔹 **Finanzas y Servicios Profesionales**
  BANCO = 'Banco/Entidad Financiera',
  SEGUROS = 'Seguros',
  ESTUDIO_JURIDICO = 'Estudio Jurídico',
  ESTUDIO_CONTABLE = 'Estudio Contable',
  MARKETING_PUBLICIDAD = 'Marketing y Publicidad',
  RRHH = 'Recursos Humanos',
  CONSULTORIA = 'Consultoría',

  // 🔹 **Arte y Entretenimiento**
  CINE = 'Cine',
  TEATRO = 'Teatro',
  MUSICA = 'Música',
  GALERIA_ARTE = 'Galería de Arte',
  EVENTOS = 'Eventos',
  AGENCIA_TURISMO = 'Agencia de Turismo',
  JUEGOS_ENTRETENIMIENTO = 'Juegos y Entretenimiento',

  // 🔹 **Hogar y Jardín**
  MUEBLERIA = 'Mueblería',
  TIENDA_DECORACION = 'Tienda de Decoración',
  VIVEROS = 'Vivero',
  ELECTRODOMESTICOS = 'Venta de Electrodomésticos',

  // 🔹 **Mascotas**
  VETERINARIA = 'Veterinaria',
  TIENDA_MASCOTAS = 'Tienda de Mascotas',
  ADIESTRAMIENTO = 'Adiestramiento de Mascotas',
  PELUQUERIA_CANINA = 'Peluquería Canina',

  // 🔹 **Industria y Manufactura**
  FABRICA_TEXTIL = 'Fábrica Textil',
  INDUSTRIA_METALURGICA = 'Industria Metalúrgica',
  INDUSTRIA_QUIMICA = 'Industria Química',
  INDUSTRIA_ALIMENTICIA = 'Industria Alimenticia',

  // 🔹 **Otros**
  ONG = 'Organización No Gubernamental',
  SERVICIOS_GENERALES = 'Servicios Generales',
  MULTIRUBRO = 'Negocio Multirubro',
}
