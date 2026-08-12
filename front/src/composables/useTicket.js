import api from "@/config/axios.config";

/**
 * Composable para generar y emitir tickets de venta.
 * Genera HTML en un iframe oculto y usa window.print() nativo.
 * Esto evita todos los problemas de popup-blocker y PDF blob en Chrome.
 */
export function useTicket() {
  /**
   * Genera un ticket de venta y lo imprime via iframe HTML.
   * @param {Object} params - Datos para generar el ticket
   */
  async function emitirTicket(params) {
    const {
      items,
      shopData,
      ticketType = "Ticket",
      clientName = "",
      userName = "",
      listName = "",
      subtotal = 0,
      total = 0,
      tax = 0,
      ivaEnabled = false,
      discountValue = 0,
      discountType = "amount",
      discountAmount = 0,
      surchargeValue = 0,
      surchargeType = "amount",
      surchargeAmount = 0,
      paymentMethod = "Efectivo",
      paymentMethods = [],
      observations = "",
      saleNumber = "",
      sendByEmail = false,
      clientEmail = "",
    } = params;

    const ticketNumber = saleNumber || `TK-${Date.now().toString().slice(-8)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const itemsToShow = items || [];
    const totalItems = itemsToShow.reduce((sum, item) => sum + item.quantity, 0);

    // --- Construir filas de productos ---
    const productRows = itemsToShow.map((item, index) => {
      const name = item.name || "Producto";
      const qty = item.quantity || 1;
      const price = (item.sellPrice || 0).toFixed(2);
      const subtotalItem = ((item.sellPrice || 0) * qty).toFixed(2);
      let variantHtml = "";
      if (item.variants && (item.variants.size || item.variants.color)) {
        const parts = [];
        if (item.variants.size) parts.push(`Talla: ${item.variants.size}`);
        if (item.variants.color) parts.push(`Color: ${item.variants.color}`);
        variantHtml = `<tr><td colspan="4" style="padding:0 4px 3px 8px;font-size:9px;color:#666;font-style:italic;">${parts.join(" - ")}</td></tr>`;
      }
      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:3px 4px;font-size:10px;">${index + 1}. ${name}</td>
          <td style="padding:3px 4px;font-size:10px;text-align:center;">${qty}</td>
          <td style="padding:3px 4px;font-size:10px;text-align:right;">$${price}</td>
          <td style="padding:3px 4px;font-size:10px;text-align:right;">$${subtotalItem}</td>
        </tr>
        ${variantHtml}`;
    }).join("");

    // --- Construir métodos de pago ---
    let paymentHtml = "";
    if (paymentMethods.length > 0) {
      paymentHtml = paymentMethods.map(m =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;margin:1px 0;">
          <span>${m.method}:</span><span>$${(m.amount || 0).toFixed(2)}</span>
        </div>`
      ).join("");
      const efectivo = paymentMethods.find(m => m.method.toLowerCase().includes("efectivo"));
      if (efectivo && efectivo.amount > total) {
        const cambio = efectivo.amount - total;
        paymentHtml += `<div style="display:flex;justify-content:space-between;font-size:10px;margin:1px 0;color:#c0392b;">
          <span>Cambio:</span><span>$${cambio.toFixed(2)}</span>
        </div>`;
      }
    } else {
      paymentHtml = `<div style="font-size:10px;">${paymentMethod}</div>`;
    }

    // --- Descuento / Recargo / IVA ---
    let extraLines = "";
    if (discountValue > 0) {
      const label = discountType === "percentage"
        ? `Descuento (${discountValue}%):` : "Descuento:";
      extraLines += `<div style="display:flex;justify-content:space-between;font-size:10px;">
        <span>${label}</span><span style="color:#c0392b;">-$${discountAmount.toFixed(2)}</span></div>`;
    }
    if (surchargeValue > 0) {
      const label = surchargeType === "percentage"
        ? `Recargo (${surchargeValue}%):` : "Recargo:";
      extraLines += `<div style="display:flex;justify-content:space-between;font-size:10px;">
        <span>${label}</span><span>+$${surchargeAmount.toFixed(2)}</span></div>`;
    }
    if (ivaEnabled) {
      extraLines += `<div style="display:flex;justify-content:space-between;font-size:10px;">
        <span>IVA (21%):</span><span>$${tax.toFixed(2)}</span></div>`;
    }

    // --- Observaciones ---
    const obsHtml = observations && observations.trim()
      ? `<div style="margin-top:6px;border-top:1px dashed #ccc;padding-top:4px;">
          <div style="font-size:9px;font-weight:bold;">OBSERVACIONES:</div>
          <div style="font-size:9px;">${observations}</div>
        </div>` : "";

    // --- Lista de precios ---
    const listHtml = listName
      ? `<div style="font-size:9px;">Lista: ${listName}</div>` : "";

    // --- HTML del ticket ---
    const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket ${ticketNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      width: 80mm;
      padding: 4mm;
      color: #000;
      background: #fff;
    }
    @page {
      size: 80mm auto;
      margin: 0;
    }
    @media print {
      html, body { width: 80mm; }
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px solid #000; margin: 4px 0; }
    .dashed { border-top: 1px dashed #000; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 9px; font-weight: bold; border-bottom: 1px solid #000; padding: 2px 4px; }
    .aviso {
      border: 2px solid #000;
      padding: 4px;
      margin: 6px 0;
      text-align: center;
      font-size: 8px;
    }
    .total-box {
      border: 2px solid #000;
      padding: 4px 6px;
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <!-- ENCABEZADO -->
  <div class="center bold" style="font-size:14px;">${shopData?.name || "Mi Negocio"}</div>
  <div class="center" style="font-size:9px;">${shopData?.address || ""}</div>
  <div class="center" style="font-size:9px;">${shopData?.city || ""}</div>
  <div class="center" style="font-size:9px;">Tel: ${shopData?.phone || ""}</div>

  <div class="line"></div>

  <!-- AVISO FISCAL -->
  <div class="aviso">
    <div class="bold" style="font-size:9px;">COMPROBANTE INTERNO</div>
    <div style="font-size:8px;">NO VÁLIDO COMO FACTURA</div>
  </div>

  <!-- INFO TICKET -->
  <div class="center bold" style="font-size:12px;margin:4px 0;">${ticketType.toUpperCase()}</div>
  <div class="dashed"></div>
  <div style="font-size:9px;">Ticket N°: <b>${ticketNumber}</b></div>
  <div style="font-size:9px;">Fecha: ${formattedDate}</div>
  <div style="font-size:9px;">Hora: ${formattedTime}</div>
  <div style="font-size:9px;">Cliente: ${clientName || "CONSUMIDOR FINAL"}</div>
  <div style="font-size:9px;">Vendedor: ${userName || "—"}</div>
  ${listHtml}
  <div class="line"></div>

  <!-- PRODUCTOS -->
  <div class="center bold" style="font-size:10px;margin-bottom:3px;">DETALLE</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Descripción</th>
        <th style="text-align:center;">Cant</th>
        <th style="text-align:right;">P.Unit</th>
        <th style="text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${productRows}
    </tbody>
  </table>

  <div class="line"></div>

  <!-- TOTALES -->
  <div style="display:flex;justify-content:space-between;font-size:10px;">
    <span>Total items:</span><span>${totalItems}</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:10px;">
    <span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span>
  </div>
  ${extraLines}

  <div class="line"></div>
  <div class="total-box">
    <span class="bold" style="font-size:13px;">TOTAL:</span>
    <span class="bold" style="font-size:13px;">$${total.toFixed(2)}</span>
  </div>

  <!-- PAGO -->
  <div class="dashed"></div>
  <div class="bold" style="font-size:10px;">FORMA DE PAGO:</div>
  ${paymentHtml}

  ${obsHtml}

  <!-- PIE -->
  <div class="line" style="margin-top:8px;"></div>
  <div class="center bold" style="font-size:11px;">¡GRACIAS POR SU COMPRA!</div>
  <div class="center" style="font-size:8px;margin-top:3px;">Alevia Pay - Gestión &amp; E-Commerce</div>
  <div class="center" style="font-size:8px;">Cod: ${ticketNumber}</div>
  <div style="margin-bottom:8mm;"></div>
</body>
</html>`;

    // --- Enviar por email si corresponde ---
    if (sendByEmail && clientEmail) {
      try {
        // Para el email usamos el blob de texto HTML directamente
        const htmlBlob = new Blob([ticketHtml], { type: "text/html" });
        const formData = new FormData();
        formData.append("file", htmlBlob, `ticket-${ticketNumber}.html`);
        formData.append("email", clientEmail);
        formData.append("subject", "Ticket de compra");
        formData.append("businessName", shopData?.name || "");
        formData.append("total", total.toFixed(2));
        formData.append("date", now.toISOString());
        formData.append(
          "paymentSummary",
          JSON.stringify(
            paymentMethods.length > 0
              ? paymentMethods
              : [{ method: paymentMethod, amount: total }],
          ),
        );
        await api.post("/emails/post/send-ticket", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`Ticket enviado por email a: ${clientEmail}`);
      } catch (error) {
        console.error("Error al enviar ticket por email:", error);
      }
    }

    // --- Imprimir via iframe HTML (100% confiable en todos los navegadores) ---
    return new Promise((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:90mm;height:0;border:0;visibility:hidden;";

      document.body.appendChild(iframe);

      // Escribir el HTML directamente en el iframe (sin URL de blob, sin plugin PDF)
      iframe.contentDocument.open();
      iframe.contentDocument.write(ticketHtml);
      iframe.contentDocument.close();

      // Esperar a que cargue el HTML y luego imprimir
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
        resolve(true);
      };

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.error("Error al imprimir:", err);
          document.body.removeChild(iframe);
          resolve(false);
        }
        // Limpiar el iframe después de 10 segundos como seguridad
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch (_) {}
          resolve(true);
        }, 10000);
      }, 300);
    });
  }

  return { emitirTicket };
}
