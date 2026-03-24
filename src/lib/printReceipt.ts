import { Transaction } from './types';

export function printReceipt(tx: Transaction, storeName = 'BuildMat Store') {
  const receiptWindow = window.open('', '_blank', 'width=350,height=600');
  if (!receiptWindow) return;

  const date = new Date(tx.date);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString();

  const itemsHtml = tx.items.map(item => {
    const taxLines = item.taxes.map(t =>
      `<tr style="font-size:11px;color:#666"><td style="padding-left:12px">${t.name} (${t.percentage}%)</td><td style="text-align:right">₹${t.amount.toFixed(2)}</td></tr>`
    ).join('');
    return `
      <tr>
        <td>${item.materialName}</td>
        <td style="text-align:right">₹${item.unitPrice} × ${item.quantity}</td>
      </tr>
      ${taxLines}
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; }
        }
        body { font-family: 'Courier New', monospace; font-size: 13px; width: 280px; margin: 0 auto; padding: 10px; }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #333; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        .bold { font-weight: bold; }
        .total-row td { font-size: 16px; font-weight: bold; padding-top: 6px; }
      </style>
    </head>
    <body>
      <div class="center"><strong>${storeName}</strong></div>
      <div class="center" style="font-size:11px;color:#666">Receipt</div>
      <div class="divider"></div>
      <table>
        <tr><td>Date:</td><td style="text-align:right">${dateStr}</td></tr>
        <tr><td>Time:</td><td style="text-align:right">${timeStr}</td></tr>
        <tr><td>Invoice:</td><td style="text-align:right">${tx.id}</td></tr>
        <tr><td>Cashier:</td><td style="text-align:right">${tx.soldBy}</td></tr>
      </table>
      <div class="divider"></div>
      <table>${itemsHtml}</table>
      <div class="divider"></div>
      <table>
        <tr><td>Subtotal</td><td style="text-align:right">₹${tx.subtotal.toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right">₹${tx.totalTax.toFixed(2)}</td></tr>
        <tr class="total-row"><td>TOTAL</td><td style="text-align:right">₹${tx.totalPrice.toFixed(2)}</td></tr>
      </table>
      <div class="divider"></div>
      <div class="center" style="font-size:11px;color:#666;margin-top:8px">Thank you for your purchase!</div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  receiptWindow.document.write(html);
  receiptWindow.document.close();
}
