import api from "@/config/axios.config";

/**
 * Generador de código de barras SVG (Code 39) en JavaScript puro
 */
function generateBarcodeSVG(text) {
  const code39Patterns = {
    '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
    '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
    '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
    'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
    'G': '101001011101', 'H': '110100101101', 'I': '101100101101', 'J': '101001101101',
    'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
    'O': '110101101001', 'P': '101101101001', 'Q': '101001011011', 'R': '110100101101',
    'S': '101100101101', 'T': '101001101101', 'U': '110010101011', 'V': '100110101011',
    'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
    '-': '100101011011', ' ': '100110101101', '*': '100101101101'
  };
  
  const rawStr = (text || '000123456789').toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-12);
  const cleanText = '*' + (rawStr || 'TICKET123') + '*';
  let bars = '';
  let x = 10;
  
  for (let char of cleanText) {
    const pattern = code39Patterns[char] || code39Patterns['0'];
    for (let bit of pattern) {
      if (bit === '1') {
        bars += `<rect x="${x}" y="0" width="1.6" height="42" fill="#000" />`;
      }
      x += 2.0;
    }
    x += 1.8;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 10} 45" style="width:75%;height:45px;display:block;margin:0 auto;">${bars}</svg>`;
}

/**
 * Formateador de moneda en pesos argentinos ($1.350,00)
 */
function formatMoneyAR(amount) {
  const val = Number(amount) || 0;
  return '$' + val.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Composable para generar y emitir tickets de venta.
 * Diseño exacto al mockup del ticket argentino con tipografía monocroma y secciones.
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

    const rawNum = saleNumber || `0001-${Date.now().toString().slice(-8)}`;
    const ticketNumber = rawNum.startsWith('TK-') ? `0001-${rawNum.replace('TK-', '')}` : rawNum;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const itemsToShow = items || [];
    const shopName = (shopData?.name || "MI KIOSCO").toUpperCase();
    const instagramHandle = shopData?.instagram || `@${shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const addressStr = shopData?.address || "Lisandro de la Torre 1000";
    const cityStr = shopData?.city ? `${shopData.city}, Córdoba, Argentina` : "Villa María, Córdoba, Argentina";
    const cashierName = userName || "Vendedor";

    // --- SECCIÓN 3: DETALLE DE PRODUCTOS ---
    const productRows = itemsToShow.map((item) => {
      const name = item.name || "Producto";
      const qty = item.quantity || 1;
      const unitPrice = item.sellPrice || 0;
      const itemTotal = unitPrice * qty;

      let variantText = "";
      if (item.variants && (item.variants.size || item.variants.color)) {
        const parts = [];
        if (item.variants.size) parts.push(`Talla: ${item.variants.size}`);
        if (item.variants.color) parts.push(`Color: ${item.variants.color}`);
        variantText = `<div style="font-size:9px;color:#555;font-style:italic;margin-left:14px;">${parts.join(" - ")}</div>`;
      }

      return `
        <div style="margin: 3px 0; font-size: 11px;">
          <div style="display: grid; grid-template-columns: 24px 1fr 68px 68px; align-items: baseline;">
            <span>${qty}</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 4px;">${name}</span>
            <span style="text-align: right;">${formatMoneyAR(unitPrice)}</span>
            <span style="text-align: right; font-weight: bold;">${formatMoneyAR(itemTotal)}</span>
          </div>
          ${variantText}
        </div>`;
    }).join("");

    // --- SECCIÓN 4: TOTALES Y PAGO ---
    const subtotalFormatted = formatMoneyAR(subtotal || total);
    const totalFormatted = formatMoneyAR(total);
    const discountFormatted = formatMoneyAR(discountAmount);

    let paymentMethodName = paymentMethod;
    let paymentAmount = total;
    let changeAmount = 0;

    if (paymentMethods.length > 0) {
      paymentMethodName = paymentMethods[0].method || paymentMethod;
      paymentAmount = paymentMethods[0].amount || total;
      if (paymentAmount > total) {
        changeAmount = paymentAmount - total;
      }
    }

    const barcodeSVG = generateBarcodeSVG(ticketNumber.replace(/[^A-Za-z0-9]/g, ''));
    const internalCodeStr = `75${Date.now().toString().slice(-10)}`;
    const barcodeNumberStr = `${ticketNumber.replace(/[^0-9]/g, '')}${day}${month}${year}${hours}${minutes}`;

    // --- PLANTILLA HTML EXACTA AL DISEÑO TICKET ARGENTINO ---
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
      width: 78mm;
      padding: 3mm 4mm;
      color: #000;
      background: #fff;
      line-height: 1.25;
    }
    @page {
      size: 78mm auto;
      margin: 0;
    }
    @media print {
      html, body { width: 78mm; padding: 2mm 3mm; }
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .dashed-line {
      border-bottom: 1px dashed #000;
      margin: 6px 0;
    }
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .star-divider {
      text-align: center;
      font-size: 10px;
      margin: 4px 0;
      letter-spacing: 2px;
    }
    .logo-badge {
      width: 56px;
      height: 56px;
      border: 3px double #000;
      border-radius: 50%;
      margin: 0 auto 6px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
      line-height: 1.1;
    }
  </style>
</head>
<body>

  <!-- SECCIÓN 1: ENCABEZADO -->
  <div class="logo-badge">
    LA 10
  </div>
  
  <div class="center bold" style="font-size: 15px; letter-spacing: 0.5px;">${shopName}</div>
  <div class="star-divider">★</div>
  <div class="center" style="font-size: 10px; margin-bottom: 4px;">📷 ${instagramHandle}</div>

  <div class="dashed-line"></div>

  <div class="center" style="font-size: 10px;">📍 ${addressStr}</div>
  <div class="center" style="font-size: 10px;">${cityStr}</div>

  <div class="dashed-line"></div>

  <!-- SECCIÓN 2: DATOS DEL TICKET -->
  <div class="center bold" style="font-size: 12px; margin-bottom: 4px; letter-spacing: 0.5px;">
    TICKET Nº ${ticketNumber}
  </div>
  
  <div class="flex-between" style="font-size: 10px;">
    <span>Fecha: ${formattedDate}</span>
    <span>Hora: ${formattedTime}</span>
  </div>
  <div style="font-size: 10px;">Vendedor: ${cashierName}</div>

  <div class="dashed-line"></div>

  <!-- SECCIÓN 3: DETALLE DE PRODUCTOS -->
  <div style="font-size: 10px; font-weight: bold; margin-bottom: 4px;">
    <div style="display: grid; grid-template-columns: 24px 1fr 68px 68px;">
      <span>CANT.</span>
      <span>DESCRIPCIÓN</span>
      <span class="right">P.UNIT</span>
      <span class="right">TOTAL</span>
    </div>
  </div>

  ${productRows}

  <div class="dashed-line"></div>

  <!-- SECCIÓN 4: TOTALES Y PAGO -->
  <div class="flex-between" style="font-size: 11px; margin-bottom: 2px;">
    <span>SUBTOTAL</span>
    <span>${subtotalFormatted}</span>
  </div>

  ${discountValue > 0 ? `
  <div class="flex-between" style="font-size: 11px; margin-bottom: 2px;">
    <span>DESCUENTO</span>
    <span>-${discountFormatted}</span>
  </div>` : `
  <div class="flex-between" style="font-size: 11px; margin-bottom: 2px;">
    <span>DESCUENTO</span>
    <span>$0,00</span>
  </div>`}

  <div class="flex-between bold" style="font-size: 14px; margin: 4px 0;">
    <span>TOTAL</span>
    <span>${totalFormatted}</span>
  </div>

  <div class="dashed-line"></div>

  <div class="bold" style="font-size: 10px; margin-bottom: 2px;">PAGO</div>
  <div class="flex-between" style="font-size: 11px; margin-bottom: 2px;">
    <span>${paymentMethodName}</span>
    <span>${formatMoneyAR(paymentAmount)}</span>
  </div>
  ${changeAmount > 0 ? `
  <div class="flex-between" style="font-size: 11px; margin-bottom: 2px;">
    <span>VUELTO</span>
    <span>${formatMoneyAR(changeAmount)}</span>
  </div>` : ''}

  <div class="dashed-line"></div>

  <!-- SECCIÓN 5: MENSAJE -->
  <div class="center bold" style="font-size: 11px; margin-top: 4px;">
    💙 ¡GRACIAS POR TU COMPRA!
  </div>
  <div class="center" style="font-size: 10px; margin-bottom: 4px;">
    Te esperamos siempre en ${shopData?.name || "nuestro local"}
  </div>

  <div class="dashed-line"></div>

  <!-- SECCIÓN 6: PIE DE PÁGINA FISCAL / CÓDIGO -->
  <div style="margin: 6px 0;">
    ${barcodeSVG}
    <div class="center" style="font-size: 8px; letter-spacing: 1px; margin-top: 2px;">${barcodeNumberStr}</div>
  </div>

  <div class="center" style="font-size: 8px; margin: 4px 0;">
    --- CÓDIGO INTERNO: ${internalCodeStr} ---
  </div>

  <div class="star-divider">★</div>

  <div class="center" style="font-size: 9px;">¡Cuidemos el medio ambiente!</div>
  <div class="center" style="font-size: 9px; font-weight: bold; margin-top: 1px;">Este ticket no es factura</div>

  <div style="margin-bottom: 6mm;"></div>

</body>
</html>`;

    // --- Enviar por email si corresponde ---
    if (sendByEmail && clientEmail) {
      try {
        const htmlBlob = new Blob([ticketHtml], { type: "text/html" });
        const formData = new FormData();
        formData.append("file", htmlBlob, `ticket-${ticketNumber}.html`);
        formData.append("email", clientEmail);
        formData.append("subject", `Ticket de compra - ${shopName}`);
        formData.append("businessName", shopName);
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
      } catch (error) {
        console.error("Error al enviar ticket por email:", error);
      }
    }

    // --- Imprimir via iframe HTML nativo (100% confiable) ---
    return new Promise((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:80mm;height:0;border:0;visibility:hidden;";

      document.body.appendChild(iframe);

      iframe.contentDocument.open();
      iframe.contentDocument.write(ticketHtml);
      iframe.contentDocument.close();

      iframe.contentWindow.onafterprint = () => {
        try { document.body.removeChild(iframe); } catch (_) {}
        resolve(true);
      };

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.error("Error al imprimir:", err);
          try { document.body.removeChild(iframe); } catch (_) {}
          resolve(false);
        }
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch (_) {}
          resolve(true);
        }, 10000);
      }, 300);
    });
  }

  return { emitirTicket };
}
