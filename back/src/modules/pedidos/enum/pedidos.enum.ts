export enum PedidosPaymentEnum {
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia',
  CUENTA = 'Cuenta corriente',
  CREDITO = 'Credito',
  DEBITO = 'Debito',
  MERCADOPAGO = 'Mercado Pago',
  PRESENCIAL = 'Presencial',
}
export enum PedidosStatusEnum {
  PENDIENTE = 'Pendiente',
  EN_PREPARACION = 'En preparacion',
  LISTO = 'Listo',
  ENTREGADO = 'Entregado',
  CANCELADO = 'Cancelado',
  RECHAZADO = 'Rechazado',
}

export enum PedidosPaymentStatusEnum {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  RECHAZADO = 'Rechazado',
  CANCELADO = 'Cancelado',
}

export enum PedidoTypeEnum {
  DELIVERY = 'Delivery',
  RETIRO = 'Retiro',
}
