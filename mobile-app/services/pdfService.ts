import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { cacheDirectory, moveAsync } from 'expo-file-system/legacy';
import { Campaign, Donation, Expense } from '@/constants/types';

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateAuditPDF = async (campaign: Campaign, transactions: any[]) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #000; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            
            .title { text-align: center; margin-top: 30px; margin-bottom: 30px; }
            .title h2 { text-transform: uppercase; margin: 0; font-size: 18px; border-bottom: 1px solid #eee; display: inline-block; padding-bottom: 5px; }
            
            .summary { margin-bottom: 30px; }
            .summary table { width: 100%; border-collapse: collapse; }
            .summary td { padding: 10px; border: 1px solid #eee; }
            .summary .label { font-weight: bold; background-color: #f9f9f9; width: 30%; }
            
            .transactions { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .transactions th { background-color: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
            .transactions td { padding: 10px; border: 1px solid #eee; font-size: 11px; }
            .type-income { color: #10b981; font-weight: bold; }
            .type-expense { color: #e11d48; font-weight: bold; }
            
            .footer { position: fixed; bottom: 40px; left: 40px; right: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
            .signature { margin-top: 50px; text-align: right; }
            .signature-space { height: 80px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>GENEROUS FUND TRACKER</h1>
            <p>Sistem Akuntabilitas Ledger Real-time • Laporan Audit Digital</p>
            <p>ID Transmisi: AUDIT-${campaign.id.substring(0, 8).toUpperCase()}</p>
        </div>

        <div class="title">
            <h2>LAPORAN AKUNTABILITAS PUBLIK</h2>
        </div>

        <div class="summary">
            <table>
                <tr>
                    <td class="label">Nama Wadah</td>
                    <td>${campaign.title}</td>
                </tr>
                <tr>
                    <td class="label">Kategori</td>
                    <td>${campaign.category}</td>
                </tr>
                <tr>
                    <td class="label">Target Pendanaan</td>
                    <td>${formatRp(campaign.target_amount)}</td>
                </tr>
                <tr>
                    <td class="label">Terkumpul (Confirmed)</td>
                    <td>${formatRp(campaign.current_amount)}</td>
                </tr>
                <tr>
                    <td class="label">Status Audit</td>
                    <td><strong>TERVALIDASI SISTEM</strong></td>
                </tr>
                <tr>
                    <td class="label">Tanggal Cetak</td>
                    <td>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            </table>
        </div>

        <h3>RIWAYAT LEDGER TERAKHIR</h3>
        <table class="transactions">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th>Tipe</th>
                    <th>Jumlah</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(item => `
                    <tr>
                        <td>${new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>${item.display_name} ${item.description ? `<br><small style="color:#666">${item.description}</small>` : ''}</td>
                        <td class="${item.type === 'income' ? 'type-income' : 'type-expense'}">
                            ${item.type === 'income' ? 'MASUK' : 'KELUAR'}
                        </td>
                        <td align="right">
                            ${item.type === 'income' ? '+' : '-'}${formatRp(item.amount)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="signature">
            <p>Diterbitkan Oleh Sistem Generous App,</p>
            <div class="signature-space"></div>
            <p><strong>ADMINISTRASI SISTEM CENTER</strong></p>
            <p style="font-size: 8px;">Dokumen ini dihasilkan secara otomatis dan sah tanpa tanda tangan basah.</p>
        </div>

        <div class="footer">
            Generous Fund Tracker Ledger System • Secure Audit v2.0 • Real-time Accountability
        </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Generate custom filename
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    // Clean title for filename (remove special chars)
    const cleanTitle = campaign.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const fileName = `${cleanTitle}_${dateStr}.pdf`;
    const newUri = `${cacheDirectory}${fileName}`;
    
    // Move to identifiable name
    await moveAsync({
      from: uri,
      to: newUri
    });
    
    await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('[PDF Service] Generation Error:', error);
    throw error;
  }
};
