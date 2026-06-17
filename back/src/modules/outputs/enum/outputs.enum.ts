export enum OutputsCategoriesEnum {
  // Egresos comunes
  Alquiler = 'Alquiler',
  Servicios = 'Servicios', // Luz, agua, gas
  Sueldos = 'Sueldos',
  Impuestos = 'Impuestos',
  Seguros = 'Seguros',
  Mantenimiento = 'Mantenimiento',
  InsumosDeOficina = 'Insumos de oficina',
  ServiciosProfesionales = 'Servicios profesionales', // Contador, abogado, etc.
  PublicidadYMarketing = 'Publicidad y marketing',
  TransporteYLogistica = 'Transporte y logística',
  Comunicaciones = 'Comunicaciones', // Teléfono, internet
  ComisionesBancarias = 'Comisiones bancarias',
  PrestamosOCreditos = 'Préstamos o créditos',

  // Egresos específicos
  MateriaPrima = 'Materia prima',
  Empaques = 'Empaques',
  CostosDeExportacion = 'Costos de exportación',
  Aduana = 'Aduana',
  CostosDeProduccion = 'Costos de producción',
  LicenciasDeSoftware = 'Licencias de software',
  InvestigacionYDesarrollo = 'Investigación y desarrollo',
  Capacitacion = 'Capacitación',
}

export enum OutputsPaymentMethodsEnum {
  Efectivo = 'Efectivo',
  TarjetaCredito = 'Credito',
  TarjetaDebito = 'Debito',
  TransferenciaBancaria = 'Transferencia',
  Cheque = 'Cheque',
  CuentaCorriente = 'Cuenta corriente',
  Otros = 'Otros',
}
