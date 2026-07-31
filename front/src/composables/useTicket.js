import jsPDF from "jspdf";
import api from "@/config/axios.config";

/**
 * Composable para generar y emitir tickets PDF de venta.
 * Extraído de salesStore.js para mantener la separación de responsabilidades.
 */
export function useTicket() {
  /**
   * Genera un ticket PDF de venta profesional.
   * @param {Object} params - Datos para generar el ticket
   * @param {Array} params.items - Items del carrito
   * @param {Object} params.shopData - Datos de la tienda (name, address, city, phone)
   * @param {string} params.ticketType - Tipo de ticket ("Ticket", "Presupuesto", etc.)
   * @param {string} params.clientName - Nombre del cliente
   * @param {string} params.userName - Nombre del vendedor
   * @param {string} params.listName - Lista de precios aplicada
   * @param {number} params.subtotal - Subtotal de la venta
   * @param {number} params.total - Total final
   * @param {number} params.tax - Impuesto (IVA)
   * @param {boolean} params.ivaEnabled - Si el IVA está habilitado
   * @param {number} params.discountValue - Valor del descuento
   * @param {string} params.discountType - Tipo de descuento ("amount" | "percentage")
   * @param {number} params.discountAmount - Monto del descuento calculado
   * @param {number} params.surchargeValue - Valor del recargo
   * @param {string} params.surchargeType - Tipo de recargo ("amount" | "percentage")
   * @param {number} params.surchargeAmount - Monto del recargo calculado
   * @param {string} params.paymentMethod - Método de pago principal
   * @param {Array} params.paymentMethods - Métodos de pago múltiples
   * @param {string} params.observations - Observaciones de la venta
   * @param {string} params.saleNumber - Número de la venta
   * @param {boolean} params.sendByEmail - Si se debe enviar por email
   * @param {string} params.clientEmail - Email del cliente
   * @returns {Promise<boolean>} true si el ticket se generó correctamente
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

    const pageWidth = 80;
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;

    const itemsToShow = items || [];
    const baseHeight = 120;
    const itemHeight = itemsToShow.length * 8;
    const variantHeight = itemsToShow.reduce((acc, item) => {
      if (item.variants && (item.variants.size || item.variants.color)) {
        return acc + 4;
      }
      return acc;
    }, 0);
    const summaryHeight = 50;
    const calculatedHeight = Math.max(
      150,
      baseHeight + itemHeight + variantHeight + summaryHeight,
    );

    const doc = new jsPDF({
      unit: "mm",
      format: [pageWidth, calculatedHeight],
      orientation: "portrait",
    });

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
      second: "2-digit",
    });

    doc.setFont("helvetica");
    let yPos = 8;

    // === ENCABEZADO PROFESIONAL ===
    doc.setLineWidth(0.8);
    doc.rect(margin, yPos, contentWidth, 22);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(shopData.name, pageWidth / 2, yPos + 5, {
      align: "center",
    });

    yPos += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const empresaInfo = [
      shopData.address,
      shopData.city,
      `Tel: ${shopData.phone}`,
    ];

    empresaInfo.forEach((line) => {
      doc.text(line, pageWidth / 2, yPos, { align: "center" });
      yPos += 3;
    });

    yPos += 5;

    // === AVISO FISCAL DESTACADO ===
    doc.setLineWidth(1.2);
    doc.rect(margin, yPos, contentWidth, 18);
    doc.setLineWidth(0.4);
    doc.rect(margin + 1, yPos + 1, contentWidth - 2, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("IMPORTANTE", pageWidth / 2, yPos + 5, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(
      "ESTE NO ES UN DOCUMENTO FISCAL VALIDO",
      pageWidth / 2,
      yPos + 9,
      {
        align: "center",
      },
    );
    doc.text(
      "SOLO COMPROBANTE DE VENTA INTERNO",
      pageWidth / 2,
      yPos + 12,
      {
        align: "center",
      },
    );
    doc.text("NO VALIDO COMO FACTURA", pageWidth / 2, yPos + 15, {
      align: "center",
    });

    yPos += 23;

    // === INFORMACIÓN DEL TICKET DETALLADA ===
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(ticketType.toUpperCase(), pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 6;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const ticketNumber =
      saleNumber || `TK-${Date.now().toString().slice(-8)}`;

    const ticketInfo = [
      `Ticket No: ${ticketNumber}`,
      `Fecha: ${formattedDate}`,
      `Hora: ${formattedTime}`,
      `Cliente: ${clientName || "CONSUMIDOR FINAL"}`,
      `Vendedor: ${userName || "NO IDENTIFICADO"}`,
      `Terminal: ${
        navigator.userAgent.includes("Mobile") ? "MOVIL" : "DESKTOP"
      }`,
    ];

    if (listName) {
      ticketInfo.push(`Lista de precios: ${listName}`);
    }

    // Agregar información de envío por email si aplica
    if (sendByEmail && clientEmail) {
      ticketInfo.push(`Email enviado a: ${clientEmail}`);
    }

    ticketInfo.push(`Sesion: ${Date.now().toString().slice(-6)}`);

    ticketInfo.forEach((line) => {
      doc.text(line, margin, yPos);
      yPos += 3.5;
    });

    yPos += 3;
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 5;

    // === DETALLE DE PRODUCTOS MEJORADO CON VARIANTES ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LA OPERACION", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 6;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CANT", margin, yPos);
    doc.text("DESCRIPCION", margin + 12, yPos);
    doc.text("P.UNIT", margin + 45, yPos);
    doc.text("SUBTOTAL", margin + 60, yPos);

    yPos += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 3;

    doc.setFont("helvetica", "normal");
    let itemCounter = 1;

    itemsToShow.forEach((item, index) => {
      // Número de ítem
      doc.setFontSize(6);
      doc.text(`${itemCounter}.`, margin, yPos);

      // Cantidad
      doc.setFontSize(7);
      doc.text(`${item.quantity}`, margin + 4, yPos);

      // Nombre del producto
      doc.setFont("helvetica", "bold");
      const productName =
        item.name.length > 20
          ? item.name.substring(0, 20) + "..."
          : item.name;
      doc.text(productName, margin + 12, yPos);
      doc.setFont("helvetica", "normal");

      // Precio unitario
      doc.text(`$${item.sellPrice.toFixed(2)}`, margin + 45, yPos);

      // Subtotal
      const subtotalProduct = (item.sellPrice * item.quantity).toFixed(2);
      doc.text(`$${subtotalProduct}`, pageWidth - margin, yPos, {
        align: "right",
      });

      yPos += 4;

      // Mostrar variantes si existen
      if (item.variants && (item.variants.size || item.variants.color)) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "italic");
        let variantText = "";
        if (item.variants.size)
          variantText += `Talla: ${item.variants.size}`;
        if (item.variants.color) {
          if (variantText) variantText += " - ";
          variantText += `Color: ${item.variants.color}`;
        }
        doc.text(variantText, margin + 12, yPos);
        yPos += 3;
        doc.setFont("helvetica", "normal");
      }

      // Si el nombre era muy largo, mostrar completo abajo
      if (item.name.length > 20) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "italic");
        const fullName = doc.splitTextToSize(item.name, contentWidth - 15);
        fullName.forEach((line) => {
          doc.text(line, margin + 4, yPos);
          yPos += 2.5;
        });
        doc.setFont("helvetica", "normal");
        yPos += 1;
      }

      // Línea separadora sutil entre productos
      if (index < itemsToShow.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);
        yPos += 3;
      }

      itemCounter++;
    });

    yPos += 4;

    // === RESUMEN FINANCIERO DETALLADO ===
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const totalItems = itemsToShow.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    doc.text(`Total de items: ${totalItems}`, margin, yPos);
    yPos += 4;

    doc.text("Subtotal:", margin, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPos, {
      align: "right",
    });
    yPos += 4;

    if (discountValue > 0) {
      const discountText =
        discountType === "percentage"
          ? `Descuento aplicado (${discountValue}%):`
          : "Descuento aplicado:";
      const discountAmountStr = `-$${discountAmount.toFixed(2)}`;
      doc.text(discountText, margin, yPos);
      doc.text(discountAmountStr, pageWidth - margin, yPos, {
        align: "right",
      });
      yPos += 4;
    }

    if (surchargeValue > 0) {
      const surchargeText =
        surchargeType === "percentage"
          ? `Recargo aplicado (${surchargeValue}%):`
          : "Recargo aplicado:";
      const surchargeAmountStr = `+$${surchargeAmount.toFixed(2)}`;
      doc.text(surchargeText, margin, yPos);
      doc.text(surchargeAmountStr, pageWidth - margin, yPos, {
        align: "right",
      });
      yPos += 4;
    }

    if (ivaEnabled) {
      doc.text("IVA incluido (21%):", margin, yPos);
      doc.text(`$${tax.toFixed(2)}`, pageWidth - margin, yPos, {
        align: "right",
      });
      yPos += 4;
    }

    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 1, contentWidth, 8);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL FINAL:", margin + 2, yPos + 3);
    doc.text(
      `$${total.toFixed(2)}`,
      pageWidth - margin - 2,
      yPos + 3,
      {
        align: "right",
      },
    );

    yPos += 10;

    // === INFORMACIÓN DE PAGO DETALLADA ===
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("FORMA DE PAGO:", margin, yPos);
    yPos += 4;

    doc.setFont("helvetica", "normal");

    if (paymentMethods.length > 0) {
      paymentMethods.forEach((method) => {
        doc.text(
          `${method.method}: $${method.amount?.toFixed(2) || "0.00"}`,
          margin + 2,
          yPos,
        );
        yPos += 3;
      });
    } else {
      doc.text(`${paymentMethod}`, margin + 2, yPos);
      yPos += 4;
    }

    const efectivoMethod = paymentMethods.find((m) =>
      m.method.toLowerCase().includes("efectivo"),
    );
    if (efectivoMethod && efectivoMethod.amount > total) {
      const cambio = efectivoMethod.amount - total;
      doc.text(`Cambio entregado: $${cambio.toFixed(2)}`, margin + 2, yPos);
      yPos += 4;
    }

    yPos += 2;

    // === OBSERVACIONES ===
    if (observations && observations.trim() !== "") {
      const obsLines = doc.splitTextToSize(observations, contentWidth);
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVACIONES:", margin, yPos);
      yPos += 3;
      doc.setFont("helvetica", "italic");
      obsLines.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 3;
      });
      yPos += 2;
    }

    // === INFORMACIÓN LEGAL Y TÉCNICA ===
    yPos += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const legalInfo = [
      "ESTE COMPROBANTE NO ES DOCUMENTO FISCAL",
      "NO REEMPLAZA FACTURA LEGAL",
      "VALIDO SOLO COMO COMPROBANTE INTERNO",
      "CONSERVE ESTE TICKET",
      "",
      `Procesado: ${now.toISOString()}`,
      `Version: ${navigator.userAgent.split(" ")[0] || "Sistema POS"}`,
    ];

    // Agregar información de envío por email si aplica
    if (sendByEmail && clientEmail) {
      legalInfo.splice(
        -2,
        0,
        "",
        `Enviado por email a: ${clientEmail}`,
      );
    }

    legalInfo.forEach((line) => {
      if (line === "") {
        yPos += 2;
        return;
      }
      doc.text(line, pageWidth / 2, yPos, { align: "center" });
      yPos += 3;
    });

    yPos += 4;

    // === PIE DE PÁGINA PROFESIONAL ===
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("GRACIAS POR SU COMPRA", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Alevia Pay - Gestión & E-Commerce", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 3;
    doc.text(`Codigo: ${ticketNumber}`, pageWidth / 2, yPos, {
      align: "center",
    });

    // Generar el PDF
    const pdfBlob = doc.output("blob");

    // Si se debe enviar por email, hacerlo
    if (sendByEmail && clientEmail) {
      try {
        const formData = new FormData();
        formData.append("file", pdfBlob, `ticket-${ticketNumber}.pdf`);
        formData.append("email", clientEmail);
        formData.append("subject", "Ticket de compra");
        formData.append("businessName", shopData.name);
        formData.append("total", total.toFixed(2));
        formData.append("date", new Date().toISOString());
        formData.append(
          "paymentSummary",
          JSON.stringify(
            paymentMethods.length > 0
              ? paymentMethods
              : [{ method: paymentMethod, amount: total }],
          ),
        );

        // Enviar el pdf al servidor para enviar por mail
        await api.post("/emails/post/send-ticket", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(`Ticket enviado por email a: ${clientEmail}`);
      } catch (error) {
        console.error("Error al enviar ticket por email:", error);
        alert(
          "Error al enviar el ticket por email, pero se imprimirá normalmente",
        );
      }
    }

    // Siempre imprimir o descargar el ticket
    doc.autoPrint();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, "_blank");

    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        }, 500);
      };
    } else {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `ticket-${ticketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    }

    return true;
  }

  return { emitirTicket };
}
