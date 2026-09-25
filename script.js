// ==========================================
// YAMEIYA CLINIC SYSTEM - DEEP FUNCTIONAL DB
// ==========================================

// --- CORE DATABASE ENGINE (LocalStorage) ---
const DB_KEYS = {
  patients: 'aetheria_patients',
  products: 'aetheria_products',
  visits: 'aetheria_visits',
  prescriptions: 'aetheria_prescriptions',
  transactions: 'aetheria_transactions',
  online_orders: 'aetheria_online_orders'
};

function initDB() {
  if(!localStorage.getItem(DB_KEYS.products)) {
    // Master Products (Skincare, Obat, Treatment)
    localStorage.setItem(DB_KEYS.products, JSON.stringify([
      { sku: 'TRT-01', name: 'Acne Laser Treatment', type: 'Treatment', price_normal: 800000, price_member: 720000, stock_gudang: null, stock_apotek: null },
      { sku: 'TRT-02', name: 'Facial Glowing', type: 'Treatment', price_normal: 300000, price_member: 250000, stock_gudang: null, stock_apotek: null },
      { sku: 'SKU-01', name: 'Night Cream Premium', type: 'Skincare', price_normal: 150000, price_member: 135000, stock_gudang: 100, stock_apotek: 20 },
      { sku: 'SKU-02', name: 'Sunscreen SPF 50', type: 'Skincare', price_normal: 120000, price_member: 100000, stock_gudang: 50, stock_apotek: 10 },
      { sku: 'OBT-01', name: 'Salep Jerawat Racikan', type: 'Obat', price_normal: 85000, price_member: 85000, stock_gudang: 200, stock_apotek: 50 }
    ]));
  }
  if(!localStorage.getItem(DB_KEYS.patients)) {
    localStorage.setItem(DB_KEYS.patients, JSON.stringify([
      { id: 'RM-1001', member_id: '88992211', name: 'Amanda Rawles', wa: '081234567890', address: 'Jakarta', type: 'Member', dob: '1998-09-24' },
      { id: 'RM-1002', member_id: null, name: 'Budi Santoso', wa: '085711223344', address: 'Bekasi', type: 'Non-Member', dob: '1990-01-01' }
    ]));
  }
  if(!localStorage.getItem(DB_KEYS.visits)) localStorage.setItem(DB_KEYS.visits, JSON.stringify([]));
  if(!localStorage.getItem(DB_KEYS.prescriptions)) localStorage.setItem(DB_KEYS.prescriptions, JSON.stringify([]));
  if(!localStorage.getItem(DB_KEYS.transactions)) localStorage.setItem(DB_KEYS.transactions, JSON.stringify([]));
  if(!localStorage.getItem(DB_KEYS.online_orders)) localStorage.setItem(DB_KEYS.online_orders, JSON.stringify([]));
}

function getTable(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function saveTable(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function genId(prefix) { return prefix + '-' + Math.floor(Math.random()*9000 + 1000); }
function getToday() { return new Date().toISOString().substring(0, 10); }

initDB();

// --- CURRENT USER (SESSION) ---
window.CURRENT_USER = 'Super Admin (Owner)';

// --- DOM ELEMENTS & HELPERS ---
const contentArea = document.getElementById('content-area');
const navItems = document.querySelectorAll('.nav-item');
const adminOptions = `<option value="Owner">Super Admin (Owner)</option><option value="Admin Sinta (Frontdesk)">Admin Sinta (Frontdesk)</option><option value="Kasir Rina">Kasir Rina</option><option value="CS Tika (Online)">CS Tika (Online)</option>`;

// --- APP ROUTER & VIEWS ---
const views = {
  
  // ==========================================
  // 1. DASHBOARD
  // ==========================================
  dashboard: () => {
    const tx = getTable(DB_KEYS.transactions);
    const today = getToday();
    
    let omsetKlinik = 0, omsetOffline = 0, omsetOnline = 0, totalHarian = 0;
    
    // Filter transactions for TODAY only
    const txToday = tx.filter(t => t.isoDate === today || t.date.includes(new Date().toLocaleDateString('id-ID')));

    txToday.forEach(t => {
      if(t.type === 'Klinik') omsetKlinik += t.total;
      if(t.type === 'Skincare Offline') omsetOffline += t.total;
      if(t.type === 'Skincare Online') omsetOnline += t.total;
      totalHarian += t.total;
    });

    return `
    <div class="fade-in">
      <div class="dashboard-header">
        <div><h1 class="page-title">Dashboard Bisnis</h1><p class="page-subtitle">Pendapatan dan performa operasional saat ini.</p></div>
      </div>
      
      <!-- PEMASUKAN HARIAN -->
      <div class="panel mb-4" style="background: var(--bg-surface); padding:24px; border-left: 4px solid var(--primary);">
        <h2 style="color:var(--text-muted); font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Total Pemasukan Hari Ini</h2>
        <h1 style="color:var(--primary); font-size:36px; margin:0;">Rp ${totalHarian.toLocaleString('id-ID')}</h1>
      </div>

      <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card" style="border-top: 4px solid var(--accent)">
          <div class="stat-title">Omset Klinik Offline</div>
          <div class="stat-value">Rp ${omsetKlinik.toLocaleString('id-ID')}</div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--info)">
          <div class="stat-title">Omset Skincare Offline</div>
          <div class="stat-value">Rp ${omsetOffline.toLocaleString('id-ID')}</div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--success)">
          <div class="stat-title">Omset Skincare Online</div>
          <div class="stat-value">Rp ${omsetOnline.toLocaleString('id-ID')}</div>
        </div>
      </div>
      <div class="panel mt-4">
        <div class="panel-header"><h2 class="panel-title">Riwayat Transaksi Terbaru</h2></div>
        <div class="panel-body">
          <table class="data-table">
            <thead><tr><th>Waktu</th><th>Jenis</th><th>Total</th><th>Admin (Kasir)</th></tr></thead>
            <tbody>
              ${tx.length === 0 ? '<tr><td colspan="4">Belum ada transaksi</td></tr>' : tx.reverse().slice(0, 5).map(t => `
                <tr><td>${t.date}</td><td>${t.type}</td><td style="font-weight:bold; color:var(--success)">Rp ${t.total.toLocaleString('id-ID')}</td><td><span style="font-size:11px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${t.admin || '-'}</span></td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 2. DATA PASIEN
  // ==========================================
  pasien: () => {
    const patients = getTable(DB_KEYS.patients);
    return `
    <div class="fade-in">
      <div class="dashboard-header">
        <div><h1 class="page-title">Data Pasien & Member</h1></div>
      </div>
      <div class="panel mb-4" style="background:var(--bg-surface); padding:24px;">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom:16px;">
          <h3 style="margin:0;">Form Tambah Pasien Baru</h3>
          <div style="display:flex; align-items: center; gap:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Diinput Oleh:</span>
            <select id="p-admin" class="form-input" style="width:200px; padding:6px 12px;">
              <option value="">-- Pilih Admin --</option>
              ${adminOptions}
            </select>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <!-- Kolom 1 -->
          <div>
            <label class="form-label">Nama Lengkap</label>
            <input type="text" id="p-name" class="form-input">
            
            <label class="form-label" style="margin-top:12px;">No. WhatsApp</label>
            <input type="text" id="p-wa" class="form-input">
          </div>
          <!-- Kolom 2 -->
          <div>
            <label class="form-label">Tanggal Lahir</label>
            <input type="date" id="p-dob" class="form-input">
            
            <label class="form-label" style="margin-top:12px;">Alamat Lengkap</label>
            <input type="text" id="p-addr" class="form-input">
          </div>
          <!-- Kolom 3 -->
          <div>
            <label class="form-label">Status Member</label>
            <select id="p-type" class="form-input">
              <option value="Non-Member">Non-Member</option>
              <option value="Member">Daftar Member (+Rp100.000)</option>
            </select>
            
            <label class="form-label" style="margin-top:12px;">Foto (Opsional)</label>
            <input type="file" id="p-photo" class="form-input" accept="image/*">
          </div>
        </div>
        <div style="text-align:right; margin-top:16px;">
          <button class="btn btn-primary" onclick="ctrl.addPatient()" style="padding:10px 24px;">Simpan Pasien</button>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h2 class="panel-title">Daftar Pasien & Member</h2>
          <input type="text" id="search-pasien" class="form-input" placeholder="🔍 Cari Nama / WA / No Member / RM..." style="width:300px; padding:8px 12px;" onkeyup="ctrl.searchPasien()">
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>Foto</th><th>No. RM & Member</th><th>Nama</th><th>Kontak & Alamat</th><th>Status</th><th>Diinput Oleh</th><th>Aksi</th></tr></thead>
            <tbody id="tbody-pasien">
              ${window.renderPasienRows ? window.renderPasienRows(patients) : patients.map(p => `<tr>
                <td>
                  <div style="width:36px; height:36px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:12px; overflow:hidden;">
                    ${p.photo ? `<img src="${p.photo}" style="width:100%; height:100%; object-fit:cover;">` : p.name.charAt(0).toUpperCase()}
                  </div>
                </td>
                <td>
                  <strong style="color:var(--text-main)">RM: ${p.id}</strong><br>
                  ${p.type === 'Member' ? `<strong style="color:var(--accent); font-size:12px;">ID: ${p.member_id || 'Belum Ada'}</strong>` : '-'}
                </td>
                <td>
                  ${p.name}<br>
                  <span style="font-size:11px; color:var(--text-muted)">Lahir: ${p.dob || '-'}</span>
                  ${p.next_visit ? `<br><span style="font-size:11px; color:var(--danger); font-weight:600;">Jadwal Berikutnya: ${p.next_visit}</span>` : ''}
                </td>
                <td>${p.wa}</td>
                <td><span class="status ${p.type==='Member'?'status-success':'status-neutral'}">${p.type}</span></td>
                <td><span style="font-size:11px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${p.admin || '-'}</span></td>
                <td>
                  <button class="btn btn-accent" style="padding:4px 8px; font-size:11px; margin-bottom:4px; width:100px;" onclick="ctrl.quickVisit('${p.id}')">+ Kunjungan</button><br>
                  <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; width:100px;" onclick="ctrl.viewRekamMedis('${p.id}')">Riwayat RM</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 3. KUNJUNGAN & ANTREAN
  // ==========================================
  kunjungan: () => {
    const patients = getTable(DB_KEYS.patients);
    const visits = getTable(DB_KEYS.visits).filter(v => v.date === getToday());
    
    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Pendaftaran Kunjungan Hari Ini</h1></div></div>
      <div class="panel mb-4" style="padding:24px;">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom:16px;">
          <h3 style="margin:0;">Form Pasien Datang</h3>
          <div style="display:flex; align-items: center; gap:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Pendaftar (Frontdesk):</span>
            <select id="v-admin" class="form-input" style="width:200px; padding:6px 12px;">
              <option value="">-- Pilih Admin --</option>
              ${adminOptions}
            </select>
          </div>
        </div>
        
        <div style="display:flex; gap:12px;">
          <input list="patient-list" id="v-patient-input" class="form-input" style="flex:1;" placeholder="🔍 Ketik Nama / No RM Pasien...">
          <datalist id="patient-list">
            ${patients.map(p => `<option value="${p.id} | ${p.name}"></option>`).join('')}
          </datalist>
          <input type="text" id="v-complaint" class="form-input" placeholder="Keluhan Pasien / Tujuan" style="flex:2;">
          <button class="btn btn-primary" onclick="ctrl.addVisit()">Daftarkan Antrean</button>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><h2 class="panel-title">Antrean Hari Ini</h2></div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>No Kunjungan</th><th>Pasien</th><th>Keluhan</th><th>Status</th><th>Admin Pendaftar</th></tr></thead>
            <tbody>
              ${visits.length===0?'<tr><td colspan="5">Belum ada pasien hari ini.</td></tr>': visits.map(v => `
                <tr>
                  <td>${v.id}</td>
                  <td>${patients.find(p=>p.id===v.patient_id)?.name}</td>
                  <td>${v.complaint}</td>
                  <td><span class="status status-info">${v.status}</span></td>
                  <td><span style="font-size:11px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${v.admin || '-'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 4. PEMERIKSAAN DOKTER
  // ==========================================
  pemeriksaan: () => {
    const visits = getTable(DB_KEYS.visits).filter(v => v.status === 'Menunggu Dokter');
    const products = getTable(DB_KEYS.products);
    const treatments = products.filter(p => p.type === 'Treatment');
    const obat = products.filter(p => p.type === 'Obat');
    const patients = getTable(DB_KEYS.patients);

    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Pemeriksaan Dokter</h1><p class="page-subtitle">Proses pasien yang sedang mengantre.</p></div></div>
      
      <div class="panel mb-4" style="padding:24px;">
        <h3 style="margin-bottom:16px;">Pilih Pasien Diperiksa</h3>
        <select id="ex-visit-id" class="form-input mb-4" onchange="ctrl.loadExamForm()">
          <option value="">-- Antrean Pasien --</option>
          ${visits.map(v => `<option value="${v.id}">${v.id} - ${patients.find(p=>p.id===v.patient_id)?.name}</option>`).join('')}
        </select>
        
        <div id="exam-form" style="display:none;">
          <div class="form-group"><label class="form-label">Hasil Analisa Medis</label><textarea id="ex-notes" class="form-input" rows="2"></textarea></div>
          
          <div style="display:flex; gap:16px; margin-top:16px;">
            <div style="flex:1;">
              <label class="form-label">Tindakan / Treatment</label>
              <select id="ex-treatment" class="form-input">
                <option value="">-- Tidak ada tindakan --</option>
                ${treatments.map(t => `<option value="${t.sku}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div style="flex:1;">
              <label class="form-label">Terapis Bertugas</label>
              <select id="ex-therapist" class="form-input"><option value="None">Pilih Terapis</option><option value="Nita">Terapis Nita</option><option value="Rara">Terapis Rara</option></select>
            </div>
            <div style="flex:1;">
              <label class="form-label">Jadwal Kontrol / Treatment Berikutnya</label>
              <input type="date" id="ex-next-visit" class="form-input">
            </div>
          </div>

          <div style="margin-top:16px; border-top:1px solid #eee; padding-top:16px;">
            <label class="form-label">Resep Obat</label>
            <div style="display:flex; gap:12px;">
              <select id="ex-obat" class="form-input">
                <option value="">-- Pilih Obat Apotek --</option>
                ${obat.map(o => `<option value="${o.sku}">${o.name}</option>`).join('')}
              </select>
              <input type="number" id="ex-obat-qty" class="form-input" placeholder="Qty" value="1" style="width:80px;">
              <input type="text" id="ex-obat-dosis" class="form-input" placeholder="Dosis (Misal 2x Sehari)">
            </div>
          </div>
          
          <button class="btn btn-primary mt-4 w-100" onclick="ctrl.saveExam()">Selesai Pemeriksaan & Kirim Billing</button>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 5. APOTEK & RESEP
  // ==========================================
  resep: () => {
    const prescriptions = getTable(DB_KEYS.prescriptions).filter(r => r.status === 'Menunggu Apotek');
    const products = getTable(DB_KEYS.products);

    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Apotek & Resep</h1><p class="page-subtitle">Verifikasi dan siapkan resep dokter beserta informasi tagihannya.</p></div></div>
      <div class="panel">
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>No. Pemeriksaan</th><th>Item Obat</th><th>Dosis</th><th>Qty</th><th>Harga / Subtotal</th><th>Aksi</th></tr></thead>
            <tbody>
              ${prescriptions.length===0 ? '<tr><td colspan="6">Tidak ada resep baru.</td></tr>' : prescriptions.map(r => {
                const prod = products.find(p=>p.sku===r.obat_sku);
                const subtotal = prod ? (prod.price_normal * r.qty) : 0;
                return `
                <tr>
                  <td><strong>${r.visit_id}</strong></td>
                  <td>${prod ? prod.name : r.obat_sku}</td>
                  <td>${r.dosis}</td>
                  <td>${r.qty} Pcs</td>
                  <td>
                    <span style="font-size:11px; color:var(--text-muted);">@ Rp ${prod ? prod.price_normal.toLocaleString() : 0}</span><br>
                    <strong>Rp ${subtotal.toLocaleString('id-ID')}</strong>
                  </td>
                  <td><button class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;" onclick="ctrl.processResep('${r.id}', '${r.obat_sku}', ${r.qty})">Siapkan & Potong Stok</button></td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 6. KASIR KLINIK
  // ==========================================
  kasir_klinik: () => {
    const allVisits = getTable(DB_KEYS.visits);
    const visitsQueue = allVisits.filter(v => v.status === 'Selesai Diperiksa (Belum Bayar)' || v.status === 'Menunggu Apotek'); 
    const products = getTable(DB_KEYS.products);
    const patients = getTable(DB_KEYS.patients);
    
    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Kasir Klinik (Billing)</h1></div></div>
      <div class="panel">
        <div class="panel-body">
          <label class="form-label">Pilih Pasien Selesai Periksa</label>
          <div style="display:flex; gap:12px;">
            <select id="k-visit" class="form-input">
              <option value="">-- Pilih Antrean --</option>
              ${visitsQueue.map(v => `<option value="${v.id}">${v.id} - ${patients.find(p=>p.id===v.patient_id)?.name}</option>`).join('')}
            </select>
            <button class="btn btn-outline" onclick="ctrl.loadKasirKlinik()">Hitung Tagihan</button>
          </div>
          
          <div id="k-bill-area" style="display:none; margin-top:24px;">
            <table class="data-table mb-4">
              <thead><tr><th>Item</th><th>Harga Normal</th><th>Harga Member / Diskon</th></tr></thead>
              <tbody id="k-bill-body"></tbody>
            </table>
            <div class="flex-between" style="background:#f4f4f5; padding:16px; border-radius:8px; margin-bottom:16px;">
              <strong>Total Pembayaran</strong>
              <h2 id="k-bill-total" style="color:var(--primary)">Rp 0</h2>
            </div>
            
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:16px;">
              <div style="display:flex; align-items: center; gap:8px;">
                <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Metode:</span>
                <select id="k-method" class="form-input" style="width:130px; padding:6px 12px;">
                  <option value="Cash">Cash</option>
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              <div style="display:flex; align-items: center; gap:8px;">
                <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Kasir Bertugas:</span>
                <select id="k-admin" class="form-input" style="width:160px; padding:6px 12px;">
                  <option value="">-- Pilih Kasir --</option>
                  ${adminOptions}
                </select>
              </div>
              <button class="btn btn-primary" onclick="ctrl.payKlinik()" style="width:150px;">Bayar Lunas</button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top:24px;">
        <div class="panel-header"><h2 class="panel-title">Transaksi Selesai Hari Ini</h2></div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>No Kunjungan</th><th>Pasien</th><th>Total Lunas</th><th>Status</th><th>Aksi Invoice</th></tr></thead>
            <tbody>
              ${allVisits.filter(v=>v.status==='Lunas').length===0 ? '<tr><td colspan="5" style="text-align:center;">Belum ada transaksi selesai.</td></tr>' : 
                allVisits.filter(v=>v.status==='Lunas').map(v => {
                const pt = getTable(DB_KEYS.patients).find(p=>p.id===v.patient_id);
                return `
                <tr>
                  <td><strong>${v.id}</strong></td>
                  <td>${pt ? pt.name : '-'}</td>
                  <td><strong style="color:var(--success)">LUNAS (${v.method || 'Cash'})</strong></td>
                  <td><span class="status status-success">${v.status}</span></td>
                  <td>
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; margin-right:4px;" onclick="ctrl.printInvoice('${v.id}')">🖨️ Cetak</button>
                    <button class="btn btn-accent" style="padding:4px 8px; font-size:11px;" onclick="ctrl.waInvoice('${v.id}')">📱 Kirim WA</button>
                  </td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 7. KASIR SKINCARE OFFLINE
  // ==========================================
  kasir_skincare: () => {
    const products = getTable(DB_KEYS.products).filter(p => p.type === 'Skincare');
    const patients = getTable(DB_KEYS.patients);
    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Kasir Skincare Offline</h1><p class="page-subtitle">Penjualan langsung potong stok Apotek/Display.</p></div></div>
      <div class="panel">
        <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h2 class="panel-title">Checkout Produk</h2>
          <div style="display:flex; align-items: center; gap:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Kasir Bertugas:</span>
            <select id="pos-admin" class="form-input" style="width:200px; padding:6px 12px;">
              <option value="">-- Pilih Kasir --</option>
              ${adminOptions}
            </select>
          </div>
        </div>
        <div class="panel-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label class="form-label">Customer (Opsional)</label>
              <input list="cust-list" id="pos-cust" class="form-input" placeholder="Nama / No RM">
              <datalist id="cust-list">
                ${patients.map(p => `<option value="${p.id} | ${p.name}"></option>`).join('')}
              </datalist>
            </div>
            <div>
              <label class="form-label">Metode Pembayaran</label>
              <select id="pos-method" class="form-input">
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="QRIS">QRIS</option>
                <option value="Debit">Debit</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-top:12px;">
            <div>
              <label class="form-label">Produk Skincare (Stok Apotek)</label>
              <select id="pos-sku" class="form-input">
                <option value="">-- Pilih Skincare --</option>
                ${products.map(p => `<option value="${p.sku}">${p.name} (Stok: ${p.stock_apotek}) - Rp ${p.price_normal.toLocaleString('id-ID')}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Qty</label>
              <input type="number" id="pos-qty" class="form-input" value="1" min="1">
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-primary" onclick="ctrl.payPosOffline()" style="width:100%; height:38px;">Bayar Lunas</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 8. ONLINE ORDERS (CS)
  // ==========================================
  online_orders: () => {
    const orders = getTable(DB_KEYS.online_orders);
    const products = getTable(DB_KEYS.products).filter(p => p.type === 'Skincare');
    const patients = getTable(DB_KEYS.patients);
    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Order Management (Online)</h1></div></div>
      
      <div class="panel mb-4" style="padding:24px;">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom:16px;">
          <h3 style="margin:0;">Input Order Baru (Dari WA/Sosmed)</h3>
          <div style="display:flex; align-items: center; gap:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:500;">CS Bertugas:</span>
            <select id="o-admin" class="form-input" style="width:200px; padding:6px 12px;">
              <option value="">-- Pilih Admin --</option>
              ${adminOptions}
            </select>
          </div>
        </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom:16px;">
          <!-- Kolom 1 -->
          <div>
            <label class="form-label">Nama Customer</label>
            <input list="cust-list" id="o-cust" class="form-input" placeholder="Pilih atau Ketik Baru..." onchange="ctrl.autoFillCustomer(this.value)">
            <datalist id="cust-list">
              ${patients.map(p => `<option value="${p.id} | ${p.name}"></option>`).join('')}
            </datalist>
            
            <label class="form-label" style="margin-top:12px;">No. WhatsApp</label>
            <input type="text" id="o-wa" class="form-input">
            
            <label class="form-label" style="margin-top:12px;">Nama Akun FB / Sosmed</label>
            <input type="text" id="o-socmed" class="form-input">
            
            <label class="form-label" style="margin-top:12px;">Sumber Pesanan</label>
            <select id="o-source" class="form-input">
               <option value="Facebook">Facebook</option>
               <option value="Instagram">Instagram</option>
               <option value="WhatsApp">WhatsApp</option>
               <option value="Website">Website</option>
               <option value="Shopee">Shopee / Marketplace</option>
            </select>
          </div>

          <!-- Kolom 2 -->
          <div>
            <label class="form-label">Alamat Lengkap Tujuan</label>
            <textarea id="o-address" class="form-input" rows="3"></textarea>
            
            <label class="form-label" style="margin-top:12px;">Negara Tujuan</label>
            <input type="text" id="o-country" class="form-input" value="Indonesia">
            
            <label class="form-label" style="margin-top:12px;">Pengiriman</label>
            <select id="o-delivery" class="form-input">
               <option value="Dikirim Ekspedisi">Dikirim (Ekspedisi)</option>
               <option value="Diambil di Toko">Diambil di Klinik/Toko</option>
            </select>
          </div>

          <!-- Kolom 3 -->
          <div>
            <label class="form-label">Produk Skincare (Stok Gudang Pusat)</label>
            <select id="o-sku" class="form-input">
              <option value="">-- Pilih Barang --</option>
              ${products.map(p => `<option value="${p.sku}">${p.name} (Stok: ${p.stock_gudang}) - Rp ${p.price_normal.toLocaleString()}</option>`).join('')}
            </select>
            
            <div style="display:flex; gap:12px; margin-top:12px;">
              <div style="flex:1;">
                <label class="form-label">Qty</label>
                <input type="number" id="o-qty" class="form-input" value="1" min="1">
              </div>
              <div style="flex:1;">
                <label class="form-label">Diskon (Rp)</label>
                <input type="number" id="o-discount" class="form-input" value="0" min="0">
              </div>
            </div>
            
            <div style="display:flex; gap:12px; margin-top:12px;">
              <div style="flex:1;">
                <label class="form-label">Status Bayar</label>
                <select id="o-pay-status" class="form-input">
                   <option value="Lunas">Lunas</option>
                   <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>
              <div style="flex:1;">
                <label class="form-label">Metode</label>
                <select id="o-pay-method" class="form-input">
                   <option value="Transfer Bank">Transfer Bank</option>
                   <option value="COD">COD</option>
                   <option value="Cash (Toko)">Cash</option>
                </select>
              </div>
            </div>
            
            <label class="form-label" style="margin-top:12px;">Upload Bukti Transfer</label>
            <input type="file" id="o-bukti" class="form-input" accept="image/*" style="padding:4px;">
          </div>
        </div>

        <div style="text-align:right;">
          <button class="btn btn-primary" style="padding:12px 24px; font-weight:bold;" onclick="ctrl.addOnlineOrder()">Simpan Pesanan Online</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h2 class="panel-title">Daftar Pesanan Online Aktif</h2></div>
        <div class="panel-body" style="padding:0; overflow-x:auto;">
          <table class="data-table" style="min-width: 1000px;">
            <thead><tr><th>No Order & Tgl</th><th>Data Customer</th><th>Rincian Pesanan</th><th>Pembayaran</th><th>Status Kirim</th></tr></thead>
            <tbody>
              ${orders.length===0 ? '<tr><td colspan="5" style="text-align:center;">Belum ada pesanan online.</td></tr>' : 
                orders.map(o => {
                const prod = products.find(p=>p.sku===o.sku);
                return `
                <tr>
                  <td>
                    <strong>${o.id}</strong><br>
                    <span style="font-size:11px; color:var(--text-muted)">${o.date}</span><br>
                    <span style="font-size:11px;">CS: ${o.admin || '-'}</span>
                  </td>
                  <td>
                    <strong style="color:var(--text-main)">${o.customer}</strong> (${o.country||'-'})<br>
                    <span style="font-size:11px;">WA: ${o.wa || '-'} | Sosmed: ${o.socmed || o.source}</span><br>
                    <span style="font-size:11px; color:var(--text-muted)">Alamat: ${o.address || '-'}</span><br>
                    <span style="font-size:10px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${o.delivery||'-'}</span>
                  </td>
                  <td>
                    ${prod ? prod.name : o.sku} <strong>(x${o.qty})</strong><br>
                    <span style="font-size:11px; color:var(--text-muted)">Harga: Rp ${(o.price||prod?.price_normal||0).toLocaleString('id-ID')}</span><br>
                    ${o.discount > 0 ? `<span style="font-size:11px; color:var(--danger)">Diskon: -Rp ${o.discount.toLocaleString('id-ID')}</span><br>` : ''}
                    <strong style="color:var(--danger)">Total: Rp ${o.total.toLocaleString('id-ID')}</strong>
                  </td>
                  <td>
                    <span class="status ${o.payStatus==='Lunas'||o.status==='Lunas'?'status-success':'status-danger'}">${o.payStatus||o.status}</span><br>
                    <span style="font-size:11px; font-weight:600;">${o.payMethod||'-'}</span>
                    ${o.bukti ? `<br><a href="${o.bukti}" target="_blank" style="font-size:11px; color:var(--primary); text-decoration:underline;">Lihat Bukti</a>` : ''}
                  </td>
                  <td>
                    <select class="form-input" style="font-size:11px; padding:4px 8px;" onchange="ctrl.updateOrderStatus('${o.id}', this.value)">
                      <option value="${o.orderStatus||'Pesanan Diproses'}" selected>${o.orderStatus||'Pesanan Diproses'}</option>
                      <option value="Pesanan Diproses">Pesanan Diproses</option>
                      <option value="Dikemas">Dikemas</option>
                      <option value="Dikirim (Selesai)">Dikirim (Selesai)</option>
                    </select>
                  </td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 9. GUDANG & INVENTORY
  // ==========================================
  gudang: () => {
    const products = getTable(DB_KEYS.products);
    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Manajemen Gudang & Stok</h1></div></div>
      
      <!-- INPUT STOK BARU (RESTOCK) -->
      <div class="panel mb-4" style="padding:24px; border-left: 4px solid var(--danger);">
        <h3 style="margin-bottom:16px;">Restock / Tambah Stok Gudang (Khusus Super Admin)</h3>
        <div style="display:flex; gap:12px;">
          <select id="in-sku" class="form-input" style="flex:2;">
            <option value="">-- Pilih Barang dari Supplier --</option>
            ${products.map(p => `<option value="${p.sku}">${p.name} (Stok Gudang saat ini: ${p.stock_gudang || 0})</option>`).join('')}
          </select>
          <input type="number" id="in-qty" class="form-input" placeholder="Qty Masuk" min="1" style="width:150px;">
          <button class="btn btn-accent" onclick="ctrl.restockGudang()">+ Tambah Stok</button>
        </div>
      </div>

      <div class="panel mb-4" style="padding:24px;">
        <h3 style="margin-bottom:16px;">Transfer Stok Gudang Utama -> Apotek (Klinik & SC Offline)</h3>
        <div style="display:flex; gap:12px;">
          <select id="tf-sku" class="form-input" style="flex:2;">
            <option value="">-- Pilih Barang --</option>
            ${products.map(p => `<option value="${p.sku}">${p.name} (Stok Gudang: ${p.stock_gudang || 0})</option>`).join('')}
          </select>
          <input type="number" id="tf-qty" class="form-input" placeholder="Qty Kirim" min="1" style="width:150px;">
          <button class="btn btn-primary" onclick="ctrl.transferStock()">Proses Transfer</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h2 class="panel-title">Master Stok Barang</h2></div>
        <div class="panel-body" style="padding:0; overflow-x:auto;">
          <table class="data-table" style="min-width: 1000px;">
            <thead><tr><th>Kode Barang</th><th>Nama Obat/Produk</th><th>Kategori</th><th>Unit</th><th>Harga Jual</th><th>QTY Gudang</th><th>QTY Apotek</th><th>Aksi</th></tr></thead>
            <tbody>
              ${products.map(p => `<tr>
                <td style="font-weight:bold;">${p.sku}</td>
                <td>${p.name}</td>
                <td><span class="status status-neutral">${p.type}</span></td>
                <td>${p.unit || 'Pcs'}</td>
                <td>Rp ${p.price_normal.toLocaleString('id-ID')}</td>
                <td style="font-weight:bold;">${p.stock_gudang !== null ? p.stock_gudang : '-'}</td>
                <td style="font-weight:bold; color:var(--info);">${p.stock_apotek !== null ? p.stock_apotek : '-'}</td>
                <td>
                  <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; margin-right:4px;" onclick="ctrl.editProduct('${p.sku}')">Edit Harga</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // 10. MARKETING CRM
  // ==========================================
  marketing: () => {
    const patients = getTable(DB_KEYS.patients);
    const todayStr = getToday().substring(5, 10);
    const bdays = patients.filter(p => p.dob && p.dob.substring(5, 10) === todayStr);

    return `
    <div class="fade-in">
      <div class="dashboard-header"><div><h1 class="page-title">Marketing & CRM</h1></div></div>
      <div class="panel">
        <div class="panel-header"><h2 class="panel-title">Notifikasi Ulang Tahun Hari Ini (${getToday()})</h2></div>
        <div class="panel-body">
          ${bdays.length > 0 ? bdays.map(p => `
            <div style="padding:16px; border:1px solid var(--success); background:var(--success-bg); border-radius:8px; margin-bottom:12px;">
              <strong>${p.name} (${p.wa})</strong> berulang tahun hari ini!
              <p style="margin-top:8px; font-style:italic;">"Selamat Ulang Tahun Kak ${p.name}! Dapatkan diskon 20% khusus hari ini di Yameiya Clinic!"</p>
              <button class="btn btn-outline mt-3" onclick="alert('Kirim WA Otomatis ke ${p.wa}')">Kirim WA Sekarang</button>
            </div>
          `).join('') : '<p>Tidak ada pasien berulang tahun hari ini.</p>'}
        </div>
      </div>
    </div>`;
  },
  
  // Fallbacks
  master_produk: () => `<div class="fade-in"><div class="panel-body"><h1>Master Produk</h1><p>Gunakan menu Gudang untuk melihat master produk terintegrasi.</p></div></div>`,
  retur: () => `<div class="fade-in"><div class="panel-body"><h1>Retur Modul</h1><p>Halaman ini bisa dihubungkan ke transaksi di menu Order Online.</p></div></div>`,
  laporan: () => `<div class="fade-in"><div class="panel-body"><h1>Laporan Keuangan</h1><p>Buka <b>Dashboard Owner</b> untuk melihat akumulasi laporan yang sudah tersambung dengan database.</p></div></div>`,
  pengaturan: () => `<div class="fade-in"><div class="panel-body"><h1>Pengaturan & Audit Log</h1><p>Data audit tersimpan di localstorage.</p></div></div>`
};

// --- HELPER UNTUK RENDER PASIEN (Bisa dipakai saat search) ---
window.renderPasienRows = (patients) => {
  if(patients.length === 0) return '<tr><td colspan="7" style="text-align:center;">Tidak ada data ditemukan.</td></tr>';
  return patients.map(p => `<tr>
    <td>
      <div style="width:36px; height:36px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:12px; overflow:hidden;">
        ${p.photo ? `<img src="${p.photo}" style="width:100%; height:100%; object-fit:cover;">` : p.name.charAt(0).toUpperCase()}
      </div>
    </td>
    <td>
      <strong style="color:var(--text-main)">RM: ${p.id}</strong><br>
      ${p.type === 'Member' ? `<strong style="color:var(--accent); font-size:12px;">ID: ${p.member_id || 'Belum Ada'}</strong>` : '-'}
    </td>
    <td>
      ${p.name}<br>
      <span style="font-size:11px; color:var(--text-muted)">Lahir: ${p.dob || '-'}</span>
      ${p.next_visit ? `<br><span style="font-size:11px; color:var(--danger); font-weight:600;">Jadwal Berikutnya: ${p.next_visit}</span>` : ''}
    </td>
    <td>
      <span style="font-weight:600;">${p.wa}</span><br>
      <span style="font-size:11px; color:var(--text-muted);">${p.address || 'Alamat belum diisi'}</span>
    </td>
    <td><span class="status ${p.type==='Member'?'status-success':'status-neutral'}">${p.type}</span></td>
    <td><span style="font-size:11px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${p.admin || '-'}</span></td>
    <td>
      <button class="btn btn-accent" style="padding:4px 8px; font-size:11px; margin-bottom:4px; width:100px;" onclick="ctrl.quickVisit('${p.id}')">+ Kunjungan</button><br>
      <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; width:100px;" onclick="ctrl.viewRekamMedis('${p.id}')">Riwayat RM</button>
    </td>
  </tr>`).join('');
};

// --- CONTROLLER LOGIC (HANDLING ALL BUTTON CLICKS) ---
const ctrl = {
  // ROLE MANAGEMENT (RBAC)
  changeRole: () => {
    const roleEl = document.getElementById('role-selector');
    if(!roleEl) return;
    const role = roleEl.value;
    window.CURRENT_USER = role;
    
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section-title');
    
    const accessMap = {
      'Super Admin (Owner)': 'ALL',
      'Frontdesk (Admin Sinta)': ['pasien', 'kunjungan'],
      'Dokter Klinik': ['pemeriksaan'],
      'Apotek': ['resep'],
      'Kasir Rina': ['kasir_klinik', 'kasir_skincare'],
      'CS Tika (Online)': ['online_orders', 'retur']
    };
    
    const allowed = accessMap[role] || 'ALL';
    
    sections.forEach(sec => {
      sec.style.display = (allowed === 'ALL') ? 'block' : 'none';
    });
    
    navItems.forEach(item => {
      const target = item.getAttribute('data-target');
      if(allowed === 'ALL' || allowed.includes(target)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem && activeItem.style.display === 'none') {
       const firstVisible = Array.from(navItems).find(i => i.style.display === 'flex');
       if(firstVisible) loadView(firstVisible.getAttribute('data-target'));
    }
  },

  // PASIEN
  searchPasien: () => {
    const q = document.getElementById('search-pasien').value.toLowerCase();
    const pts = getTable(DB_KEYS.patients).filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      p.wa.includes(q) || 
      (p.member_id && p.member_id.toLowerCase().includes(q))
    );
    document.getElementById('tbody-pasien').innerHTML = window.renderPasienRows(pts);
  },
  
  addPatient: () => {
    const name = document.getElementById('p-name').value;
    const wa = document.getElementById('p-wa').value;
    const dob = document.getElementById('p-dob').value;
    const addr = document.getElementById('p-addr').value;
    const type = document.getElementById('p-type').value;
    const fileInput = document.getElementById('p-photo');
    const admin = document.getElementById('p-admin').value || window.CURRENT_USER;
    if(!name || !wa) return alert("Nama dan WA wajib diisi!");
    
    // Generate Photo Base64 if exists
    let photoData = null;
    if(fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        photoData = e.target.result;
        finishSavePatient();
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      finishSavePatient();
    }
    
    function finishSavePatient() {
      const pts = getTable(DB_KEYS.patients);
      
      // Auto Generate RM (Rekam Medis) & Member ID if applicable
      const newId = genId('RM');
      // Generate 8-digit unique number for Member
      const memId = type === 'Member' ? Math.floor(Math.random() * 90000000 + 10000000).toString() : null;
      
      pts.push({ id: newId, member_id: memId, name, wa, address: addr, type, dob, admin, photo: photoData });
      saveTable(DB_KEYS.patients, pts);
      
      if(type === 'Member') {
        alert(`Pasien terdaftar sebagai MEMBER!\nNo Rekam Medis: ${newId}\nNomor Member: ${memId}\n\n(Silakan arahkan ke Kasir untuk pembayaran Rp 100.000)`);
      } else {
        alert(`Pasien sukses ditambahkan!\nNo Rekam Medis: ${newId}`);
      }
      loadView('pasien');
    }
  },

  // KUNJUNGAN
  // REKAM MEDIS
  viewRekamMedis: (rmId) => {
    const pts = getTable(DB_KEYS.patients);
    const p = pts.find(x=>x.id===rmId);
    if(!p) return;
    
    const visits = getTable(DB_KEYS.visits).filter(v=>v.patient_id === rmId).reverse();
    const prods = getTable(DB_KEYS.products);
    const pres = getTable(DB_KEYS.prescriptions);

    const html = `
    <div class="fade-in">
      <div class="dashboard-header">
        <div>
          <button class="btn btn-outline mb-4" onclick="loadView('pasien')">← Kembali ke Data Pasien</button>
          <h1 class="page-title">Riwayat Rekam Medis</h1>
          <p class="page-subtitle">Detail histori pemeriksaan & treatment pasien.</p>
        </div>
      </div>
      
      <div class="panel mb-4" style="padding:24px; display:flex; gap:24px; align-items:center;">
        <div style="width:80px; height:80px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:24px; overflow:hidden;">
          ${p.photo ? `<img src="${p.photo}" style="width:100%; height:100%; object-fit:cover;">` : p.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style="margin:0; color:var(--primary);">${p.name}</h2>
          <div style="color:var(--text-muted); font-size:13px; margin-top:4px;">
            <strong>No RM:</strong> ${p.id} | <strong>Status:</strong> ${p.type} ${p.member_id ? `(ID: ${p.member_id})` : ''} | <strong>WA:</strong> ${p.wa}
          </div>
          ${p.next_visit ? `<div style="margin-top:8px; display:inline-block; padding:4px 8px; background:var(--danger-bg); color:var(--danger); border-radius:4px; font-weight:600; font-size:12px;">Jadwal Treatment Berikutnya: ${p.next_visit}</div>` : ''}
          <div style="margin-top:12px;">
             <button class="btn btn-accent" style="padding:6px 12px; font-size:12px;" onclick="ctrl.quickVisit('${p.id}')">+ Daftarkan Kunjungan Baru</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Riwayat Kunjungan</h3></div>
        <div class="panel-body">
          ${visits.length === 0 ? '<p>Belum ada riwayat kunjungan / treatment.</p>' : visits.map(v => {
            const trt = prods.find(pr=>pr.sku===v.treatment_sku);
            const rList = pres.filter(r=>r.visit_id===v.id).map(r=>{
               const o = prods.find(pr=>pr.sku===r.obat_sku);
               return `${o?o.name:r.obat_sku} (${r.qty}x) - Dosis: ${r.dosis}`;
            });
            return `
            <div style="border-left: 3px solid var(--accent); padding-left:16px; margin-bottom:24px;">
              <div style="font-size:12px; color:var(--text-muted); font-weight:600;">${v.date} (Kunjungan: ${v.id})</div>
              <div style="margin-top:8px;">
                <strong>Keluhan:</strong> ${v.complaint || '-'} <br>
                <strong>Hasil Analisa Medis:</strong> ${v.notes || 'Belum diisi'} <br>
                <strong>Tindakan / Treatment:</strong> ${trt ? trt.name : '-'} ${v.therapist ? `(Oleh: ${v.therapist})` : ''} <br>
                <strong>Resep Obat:</strong> ${rList.length > 0 ? rList.join('<br>') : 'Tidak ada resep'}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
    
    // Inject custom view directly
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('content-area').innerHTML = html;
  },

  addVisit: () => {
    const ptInput = document.getElementById('v-patient-input').value;
    const ptId = ptInput ? ptInput.split(' | ')[0].trim() : '';
    const comp = document.getElementById('v-complaint').value;
    const admin = document.getElementById('v-admin').value || window.CURRENT_USER;
    if(!ptId) return alert("Pilih atau cari pasien terlebih dahulu!");
    
    // Validasi apakah ID benar ada
    const pts = getTable(DB_KEYS.patients);
    if(!pts.find(p=>p.id===ptId)) return alert("Data pasien tidak ditemukan. Pastikan memilih dari daftar yang muncul!");

    const visits = getTable(DB_KEYS.visits);
    visits.push({ id: genId('VIS'), patient_id: ptId, date: getToday(), complaint: comp, status: 'Menunggu Dokter', admin });
    saveTable(DB_KEYS.visits, visits);
    alert("Kunjungan terdaftar. Masuk antrean dokter.");
    loadView('kunjungan');
  },

  quickVisit: (ptId) => {
    const pts = getTable(DB_KEYS.patients);
    const p = pts.find(x => x.id === ptId);
    
    loadView('kunjungan');
    setTimeout(() => {
      const pInput = document.getElementById('v-patient-input');
      if (pInput && p) {
        pInput.value = `${p.id} | ${p.name}`;
        document.getElementById('v-complaint').focus();
      }
    }, 50);
  },

  // PEMERIKSAAN
  loadExamForm: () => {
    const val = document.getElementById('ex-visit-id').value;
    document.getElementById('exam-form').style.display = val ? 'block' : 'none';
  },
  saveExam: () => {
    const vId = document.getElementById('ex-visit-id').value;
    const notes = document.getElementById('ex-notes').value;
    const trt = document.getElementById('ex-treatment').value;
    const obatSku = document.getElementById('ex-obat').value;
    
    const nextVisit = document.getElementById('ex-next-visit').value;
    
    // Update Visit status
    const visits = getTable(DB_KEYS.visits);
    const vIdx = visits.findIndex(v=>v.id===vId);
    visits[vIdx].status = 'Selesai Diperiksa (Belum Bayar)';
    visits[vIdx].treatment_sku = trt;
    visits[vIdx].notes = notes;
    visits[vIdx].therapist = document.getElementById('ex-therapist').value;
    saveTable(DB_KEYS.visits, visits);

    // Save Next Visit to Patient Profile
    if(nextVisit) {
      const pts = getTable(DB_KEYS.patients);
      const ptIdx = pts.findIndex(p=>p.id===visits[vIdx].patient_id);
      if(ptIdx !== -1) {
        pts[ptIdx].next_visit = nextVisit;
        saveTable(DB_KEYS.patients, pts);
      }
    }

    // Add Prescription if any
    if(obatSku) {
      const pres = getTable(DB_KEYS.prescriptions);
      pres.push({ id: genId('RES'), visit_id: vId, obat_sku: obatSku, qty: parseInt(document.getElementById('ex-obat-qty').value), dosis: document.getElementById('ex-obat-dosis').value, status: 'Menunggu Apotek' });
      saveTable(DB_KEYS.prescriptions, pres);
    }
    alert("Pemeriksaan selesai! Pasien diarahkan ke kasir (dan apotek jika ada resep).");
    loadView('pemeriksaan');
  },

  // APOTEK
  processResep: (rId, sku, qty) => {
    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    if(prods[pIdx].stock_apotek < qty) return alert("Stok apotek tidak cukup!");
    
    prods[pIdx].stock_apotek -= qty;
    saveTable(DB_KEYS.products, prods);

    const pres = getTable(DB_KEYS.prescriptions);
    const rIdx = pres.findIndex(r=>r.id===rId);
    pres[rIdx].status = 'Obat Diserahkan';
    saveTable(DB_KEYS.prescriptions, pres);

    alert("Obat disiapkan dan stok apotek terpotong.");
    loadView('resep');
  },

  // KASIR KLINIK
  activeBill: 0,
  activeVisitId: null,
  loadKasirKlinik: () => {
    const vId = document.getElementById('k-visit').value;
    if(!vId) return;
    
    const visit = getTable(DB_KEYS.visits).find(v=>v.id===vId);
    const patient = getTable(DB_KEYS.patients).find(p=>p.id===visit.patient_id);
    const prods = getTable(DB_KEYS.products);
    const pres = getTable(DB_KEYS.prescriptions).filter(r=>r.visit_id===vId);

    let html = '';
    let total = 0;
    const isMember = patient.type === 'Member';

    // Add treatment to bill
    if(visit.treatment_sku) {
      const t = prods.find(p=>p.sku===visit.treatment_sku);
      const price = isMember ? t.price_member : t.price_normal;
      total += price;
      html += `<tr><td>${t.name} (Tindakan)</td><td>Rp ${t.price_normal.toLocaleString()}</td><td>${isMember ? 'Diskon Member: Rp '+price.toLocaleString() : '-'}</td></tr>`;
    }
    // Add prescriptons to bill
    pres.forEach(r => {
      const o = prods.find(p=>p.sku===r.obat_sku);
      const price = isMember ? o.price_member : o.price_normal;
      const sub = price * r.qty;
      total += sub;
      html += `<tr><td>${o.name} (Resep x${r.qty})</td><td>Rp ${o.price_normal.toLocaleString()}</td><td>${isMember ? 'Harga Member: Rp '+price.toLocaleString() : '-'}</td></tr>`;
    });

    document.getElementById('k-bill-body').innerHTML = html;
    document.getElementById('k-bill-total').innerText = 'Rp ' + total.toLocaleString('id-ID');
    document.getElementById('k-bill-area').style.display = 'block';
    
    ctrl.activeBill = total;
    ctrl.activeVisitId = vId;
  },
  payKlinik: () => {
    const admin = document.getElementById('k-admin').value || window.CURRENT_USER;
    const method = document.getElementById('k-method').value;
    const visits = getTable(DB_KEYS.visits);
    const vIdx = visits.findIndex(v=>v.id===ctrl.activeVisitId);
    visits[vIdx].status = 'Lunas';
    visits[vIdx].method = method;
    saveTable(DB_KEYS.visits, visits);

    const tx = getTable(DB_KEYS.transactions);
    tx.push({ id: genId('INV'), date: new Date().toLocaleString('id-ID'), isoDate: getToday(), type: 'Klinik', total: ctrl.activeBill, admin, method });
    saveTable(DB_KEYS.transactions, tx);

    alert(`Pembayaran Klinik Lunas (Rp ${ctrl.activeBill.toLocaleString()}). Terima Kasih!\n[Sistem Marketing]: Pesan auto-terkirim meminta review.`);
    loadView('kasir_klinik');
  },

  printInvoice: (vId) => {
    const visits = getTable(DB_KEYS.visits);
    const v = visits.find(x=>x.id===vId);
    if(!v) return;
    const pts = getTable(DB_KEYS.patients);
    const p = pts.find(x=>x.id===v.patient_id);
    const prods = getTable(DB_KEYS.products);
    const pres = getTable(DB_KEYS.prescriptions).filter(r=>r.visit_id===vId);
    const isMember = p && p.type === 'Member';
    
    let trtHtml = '';
    let total = 0;
    if(v.treatment_sku) {
       const trt = prods.find(x=>x.sku===v.treatment_sku);
       if(trt) {
         const price = isMember ? trt.price_member : trt.price_normal;
         trtHtml += `<tr><td>${trt.name}</td><td>1</td><td>Rp ${price.toLocaleString('id-ID')}</td></tr>`;
         total += price;
       }
    }
    pres.forEach(r => {
       const o = prods.find(x=>x.sku===r.obat_sku);
       if(o) {
         const price = isMember ? o.price_member : o.price_normal;
         let subt = price * r.qty;
         trtHtml += `<tr><td>${o.name}</td><td>${r.qty}</td><td>Rp ${subt.toLocaleString('id-ID')}</td></tr>`;
         total += subt;
       }
    });

    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write(`<html><head><title>Invoice ${vId}</title><style>body{ font-family: monospace; padding: 20px; color:#1a1a1a; } .text-center { text-align:center; } table { width:100%; border-collapse: collapse; margin-top:10px; } th, td { border-bottom: 1px dashed #ccc; padding: 6px 0; text-align:left; font-size:12px; }</style></head><body><div class="text-center"><h2 style="margin:0;">KLINIK YAMEIYA</h2><p style="margin:4px 0 16px; font-size:12px;">Struk Pembayaran Rekam Medis</p></div><div>No Kunjungan: ${v.id}</div><div>Pasien: ${p ? p.name : '-'}</div><div>Tanggal: ${v.date}</div><div>Metode: ${v.method || 'Cash'}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${trtHtml}</tbody></table><div style="text-align:right; margin-top:10px; font-weight:bold; font-size:14px;">TOTAL: Rp ${total.toLocaleString('id-ID')}</div><div class="text-center" style="margin-top:20px; font-size:11px;">Terima kasih atas kunjungan Anda!<br>Semoga lekas sembuh.</div><script>window.print();</script></body></html>`);
    w.document.close();
  },

  waInvoice: (vId) => {
    const visits = getTable(DB_KEYS.visits);
    const v = visits.find(x=>x.id===vId);
    if(!v) return;
    const pts = getTable(DB_KEYS.patients);
    const p = pts.find(x=>x.id===v.patient_id);
    if(!p || !p.wa) return alert("Pasien tidak memiliki nomor WA yang terdaftar!");
    const isMember = p && p.type === 'Member';

    const prods = getTable(DB_KEYS.products);
    const pres = getTable(DB_KEYS.prescriptions).filter(r=>r.visit_id===vId);
    
    let text = `*INVOICE KLINIK YAMEIYA*%0A====================%0ANo Kunjungan: ${v.id}%0APasien: ${p.name}%0ATanggal: ${v.date}%0AMetode: ${v.method || 'Cash'}%0A%0A*Rincian Tagihan:*%0A`;
    let total = 0;
    
    if(v.treatment_sku) {
       const trt = prods.find(x=>x.sku===v.treatment_sku);
       if(trt) {
         const price = isMember ? trt.price_member : trt.price_normal;
         text += `- ${trt.name}: Rp ${price.toLocaleString('id-ID')}%0A`;
         total += price;
       }
    }
    pres.forEach(r => {
       const o = prods.find(x=>x.sku===r.obat_sku);
       if(o) {
         const price = isMember ? o.price_member : o.price_normal;
         let subt = price * r.qty;
         text += `- ${o.name} (${r.qty}x): Rp ${subt.toLocaleString('id-ID')}%0A`;
         total += subt;
       }
    });

    text += `%0A====================%0A*TOTAL TAGIHAN: Rp ${total.toLocaleString('id-ID')}*%0A====================%0ATerima kasih telah mempercayakan perawatan Anda pada Klinik Yameiya.%0A%0A_Pesan ini dikirim secara otomatis oleh Sistem._`;
    
    let phone = p.wa.replace(/^0/, '62');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  },

  // KASIR SKINCARE OFFLINE
  payPosOffline: () => {
    const sku = document.getElementById('pos-sku').value;
    const qty = parseInt(document.getElementById('pos-qty').value);
    const method = document.getElementById('pos-method').value;
    const admin = document.getElementById('pos-admin').value || window.CURRENT_USER;
    
    let custRaw = document.getElementById('pos-cust').value;
    const cust = custRaw.includes('|') ? custRaw.split('|')[1].trim() : (custRaw.trim() || 'Guest');
    
    if(!sku) return alert("Pilih barang!");

    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    if(prods[pIdx].stock_apotek < qty) return alert("Stok apotek tidak cukup!");
    
    prods[pIdx].stock_apotek -= qty;
    saveTable(DB_KEYS.products, prods);

    const total = prods[pIdx].price_normal * qty;
    const tx = getTable(DB_KEYS.transactions);
    tx.push({ id: genId('INV'), date: new Date().toLocaleString('id-ID'), isoDate: getToday(), type: 'Skincare Offline', total, admin, method, customer: cust });
    saveTable(DB_KEYS.transactions, tx);

    alert(`Penjualan Offline Sukses! Total: Rp ${total.toLocaleString()}.\nMetode: ${method}\nCustomer: ${cust}`);
    loadView('kasir_skincare');
  },

  // ONLINE ORDERS
  autoFillCustomer: (val) => {
    if(!val || !val.includes('|')) return;
    const id = val.split('|')[0].trim();
    const pts = getTable(DB_KEYS.patients);
    const p = pts.find(x => x.id === id);
    if(p) {
       document.getElementById('o-wa').value = p.wa !== '-' ? p.wa : '';
       document.getElementById('o-address').value = p.address !== '-' ? p.address : '';
    }
  },

  addOnlineOrder: () => {
    let custRaw = document.getElementById('o-cust').value;
    const cust = custRaw.includes('|') ? custRaw.split('|')[1].trim() : custRaw.trim();
    const wa = document.getElementById('o-wa').value;
    const socmed = document.getElementById('o-socmed').value;
    const source = document.getElementById('o-source').value;
    const address = document.getElementById('o-address').value;
    const country = document.getElementById('o-country').value;
    const delivery = document.getElementById('o-delivery').value;
    
    const sku = document.getElementById('o-sku').value;
    const qty = parseInt(document.getElementById('o-qty').value);
    const discount = parseInt(document.getElementById('o-discount').value) || 0;
    const payStatus = document.getElementById('o-pay-status').value;
    const payMethod = document.getElementById('o-pay-method').value;
    const admin = document.getElementById('o-admin').value || window.CURRENT_USER;
    
    if(!cust || !sku || !qty) return alert("Nama customer, produk, dan Qty wajib diisi!");
    
    const fileInput = document.getElementById('o-bukti');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
         ctrl.finishOnlineOrder(cust, wa, socmed, source, address, country, delivery, sku, qty, discount, payStatus, payMethod, admin, e.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      ctrl.finishOnlineOrder(cust, wa, socmed, source, address, country, delivery, sku, qty, discount, payStatus, payMethod, admin, null);
    }
  },

  finishOnlineOrder: (cust, wa, socmed, source, address, country, delivery, sku, qty, discount, payStatus, payMethod, admin, buktiData) => {
    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    if(prods[pIdx].stock_gudang < qty) return alert("Stok gudang pusat tidak mencukupi!");
    
    prods[pIdx].stock_gudang -= qty;
    saveTable(DB_KEYS.products, prods);

    const price = prods[pIdx].price_normal;
    const total = (price * qty) - discount;

    const ord = getTable(DB_KEYS.online_orders);
    const oId = genId('ORD');
    ord.push({
      id: oId, date: new Date().toLocaleString('id-ID'), isoDate: getToday(),
      customer: cust, wa, socmed, source, address, country, delivery, 
      sku, qty, price, discount, total, 
      payStatus, payMethod, admin, bukti: buktiData,
      orderStatus: 'Pesanan Diproses', status: payStatus
    });
    saveTable(DB_KEYS.online_orders, ord);
    
    if(payStatus === 'Lunas') {
      const tx = getTable(DB_KEYS.transactions);
      tx.push({ id: genId('INV'), date: new Date().toLocaleString('id-ID'), isoDate: getToday(), type: 'Skincare Online', total, admin, method: payMethod });
      saveTable(DB_KEYS.transactions, tx);
    }
    
    // Auto-Register to Data Pasien (Customer Master)
    const pts = getTable(DB_KEYS.patients);
    let existingPt = null;
    if(wa && wa.trim() !== '') existingPt = pts.find(p => p.wa === wa);
    if(!existingPt) existingPt = pts.find(p => p.name.toLowerCase() === cust.toLowerCase());
    
    if(!existingPt) {
      pts.push({
         id: genId('RM'),
         name: cust,
         wa: wa || '-',
         address: address ? `${address} (${country})` : '-',
         type: 'Non-Member',
         admin: admin
      });
      saveTable(DB_KEYS.patients, pts);
    }

    alert(`Pesanan Online (${oId}) berhasil disimpan.\nTotal Tagihan: Rp ${total.toLocaleString('id-ID')}\n(Customer otomatis tersimpan ke Data Pasien)`);
    loadView('online_orders');
  },

  updateOrderStatus: (oId, newStatus) => {
    const orders = getTable(DB_KEYS.online_orders);
    const oIdx = orders.findIndex(o=>o.id===oId);
    orders[oIdx].orderStatus = newStatus;
    saveTable(DB_KEYS.online_orders, orders);
  },

  // GUDANG
  restockGudang: () => {
    // Simulasi keamanan Hak Akses
    if(window.CURRENT_USER !== 'Super Admin (Owner)') {
      return alert("DITOLAK! Hanya Super Admin yang memiliki hak akses untuk menambahkan stok barang baru dari supplier.");
    }
    
    const sku = document.getElementById('in-sku').value;
    const qty = parseInt(document.getElementById('in-qty').value);
    if(!sku || !qty) return;

    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    prods[pIdx].stock_gudang = (prods[pIdx].stock_gudang || 0) + qty;
    saveTable(DB_KEYS.products, prods);
    
    alert(`Berhasil menambah ${qty} stok baru ke Gudang Utama untuk [${prods[pIdx].name}].\n\n(Aktivitas ini dicatat oleh Super Admin)`);
    loadView('gudang');
  },
  
  transferStock: () => {
    const sku = document.getElementById('tf-sku').value;
    const qty = parseInt(document.getElementById('tf-qty').value);
    if(!sku || !qty) return;

    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    
    if(prods[pIdx].stock_gudang < qty) return alert("Stok gudang pusat tidak mencukupi!");
    
    prods[pIdx].stock_gudang -= qty;
    prods[pIdx].stock_apotek += qty;
    saveTable(DB_KEYS.products, prods);

    alert(`Berhasil transfer ${qty} pcs ke Apotek!`);
    loadView('gudang');
  },

  editProduct: (sku) => {
    if(window.CURRENT_USER !== 'Super Admin (Owner)') return alert("Akses Ditolak! Hanya Super Admin yang bisa mengubah harga/data master.");
    
    const prods = getTable(DB_KEYS.products);
    const pIdx = prods.findIndex(p=>p.sku===sku);
    const prod = prods[pIdx];
    
    const newPrice = prompt(`Edit Harga Jual [${prod.name}]:`, prod.price_normal);
    if(newPrice !== null && !isNaN(parseInt(newPrice))) {
      prods[pIdx].price_normal = parseInt(newPrice);
      saveTable(DB_KEYS.products, prods);
      alert("Harga berhasil diperbarui!");
      loadView('gudang');
    }
  },

  // ==========================================
  // MARKETING & CRM
  // ==========================================
  marketing: () => {
    const patients = getTable(DB_KEYS.patients);
    const visits = getTable(DB_KEYS.visits); 
    
    let reminderList = [];
    patients.forEach(p => {
      const pVisits = visits.filter(v => v.patient_id === p.id && v.treatment_sku);
      if(pVisits.length > 0) {
         const lastVisit = pVisits[pVisits.length-1];
         // Hitung jadwal berikutnya (estimasi 30 hari dari treatment terakhir)
         const lastDate = new Date(lastVisit.isoDate);
         lastDate.setDate(lastDate.getDate() + 30);
         const nextDateStr = lastDate.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
         
         const prods = getTable(DB_KEYS.products);
         const trt = prods.find(x=>x.sku===lastVisit.treatment_sku);
         const trtName = trt ? trt.name : 'Treatment Khusus';

         reminderList.push({ ...p, lastVisit: lastVisit.date, nextVisit: nextDateStr, treatment: trtName });
      }
    });

    const members = patients.filter(p => p.type === 'Member').length;
    const nonMembers = patients.length - members;

    return `
    <div class="fade-in">
      <div class="dashboard-header">
        <div><h1 class="page-title">CRM & Marketing Otomatis</h1><p class="page-subtitle">Kelola interaksi pelanggan, pengingat treatment, dan broadcast promo.</p></div>
      </div>
      
      <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card" style="border-top: 4px solid var(--accent)">
          <div class="stat-title">Total Member Aktif</div>
          <div class="stat-value">${members} <span style="font-size:14px; font-weight:normal; color:var(--text-muted)">Pasien</span></div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--info)">
          <div class="stat-title">Total Non-Member</div>
          <div class="stat-value">${nonMembers} <span style="font-size:14px; font-weight:normal; color:var(--text-muted)">Pasien</span></div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--success)">
          <div class="stat-title">Waktunya Treatment Ulang</div>
          <div class="stat-value">${reminderList.length} <span style="font-size:14px; font-weight:normal; color:var(--text-muted)">Pasien</span></div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Daftar Jadwal Pengingat (Reminder) Treatment</h2>
          </div>
          <div class="panel-body" style="padding:0;">
            <table class="data-table">
              <thead><tr><th>Nama Pasien</th><th>Terakhir Datang</th><th>Treatment Terakhir</th><th>Jadwal Berikutnya</th><th>Aksi</th></tr></thead>
              <tbody>
                ${reminderList.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:30px;">Belum ada riwayat treatment.</td></tr>' : 
                  reminderList.map(r => `
                  <tr>
                    <td><strong>${r.name}</strong><br><span style="font-size:11px; color:var(--text-muted)">${r.wa}</span></td>
                    <td>${r.lastVisit.split(',')[0]}</td>
                    <td>${r.treatment}</td>
                    <td style="color:var(--danger); font-weight:bold;">${r.nextVisit}</td>
                    <td>
                      <button class="btn btn-outline" style="font-size:11px; padding:6px 10px; display:flex; align-items:center; gap:4px;" onclick="window.open('https://wa.me/${r.wa.replace(/^0/,'62')}?text=Halo Kak ${r.name}, ini dari Klinik Yameiya. Waktunya untuk jadwal rutin treatment ${r.treatment} ya Kak! Yuk reservasi sekarang untuk dapatkan promo khusus.', '_blank')">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Follow-up
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="panel">
          <div class="panel-header"><h2 class="panel-title">Broadcast Promo & Custom Chat</h2></div>
          <div class="panel-body">
            <label class="form-label">Target Broadcast</label>
            <select class="form-input" style="margin-bottom:12px;" id="bc-target">
              <option>Semua Member Khusus VIP</option>
              <option>Semua Pasien (Umum)</option>
              <option>Pasien Ulang Tahun Hari Ini (${getToday()})</option>
              <option>Pasien Ulang Tahun Bulan Ini</option>
              <option>Kustom / Manual (Nomor Tertentu)</option>
            </select>
            
            <label class="form-label">Lampiran Gambar / Poster Promo (Opsional)</label>
            <input type="file" class="form-input" accept="image/*" style="margin-bottom:12px;" id="bc-image">
            
            <label class="form-label">Isi Pesan / Caption (Bisa Dikustomisasi)</label>
            <textarea class="form-input" rows="7" style="margin-bottom:12px;" id="bc-text" placeholder="Ketik pesan promosi, pemberitahuan, atau custom chat di sini...">Halo Kak, 
Khusus untuk Member Yameiya, kami ada diskon 20% untuk semua produk Skincare. 
Yuk datang ke klinik atau order online sekarang!</textarea>
            
            <button class="btn btn-primary" style="width:100%;" onclick="alert('Pesan Broadcast (Custom Teks + Gambar Lampiran) sedang dikirim ke antrean server WhatsApp Anda untuk target: ' + document.getElementById('bc-target').value)">🚀 Kirim Broadcast Massal</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  // ==========================================
  // LAPORAN KEUANGAN
  // ==========================================
  laporan: () => {
    const tx = getTable(DB_KEYS.transactions);
    
    let totalAll = 0, totalKlinik = 0, totalOffline = 0, totalOnline = 0;
    
    tx.forEach(t => {
      totalAll += t.total;
      if(t.type === 'Klinik') totalKlinik += t.total;
      if(t.type === 'Skincare Offline') totalOffline += t.total;
      if(t.type === 'Skincare Online') totalOnline += t.total;
    });

    return `
    <div class="fade-in">
      <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:flex-end;">
        <div><h1 class="page-title">Laporan Keuangan (Buku Besar)</h1><p class="page-subtitle">Akumulasi seluruh riwayat transaksi yang tersimpan di database.</p></div>
        <button class="btn btn-outline" onclick="window.print()" style="height:40px;">🖨️ Cetak Laporan</button>
      </div>
      
      <div class="panel mb-4" style="background: var(--bg-surface); padding:24px; border-left: 4px solid var(--accent);">
        <h2 style="color:var(--text-muted); font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Total Pemasukan (All-Time)</h2>
        <h1 style="color:var(--primary); font-size:36px; margin:0;">Rp ${totalAll.toLocaleString('id-ID')}</h1>
      </div>

      <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card" style="border-top: 4px solid var(--accent)">
          <div class="stat-title">Total Klinik Offline</div>
          <div class="stat-value">Rp ${totalKlinik.toLocaleString('id-ID')}</div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--info)">
          <div class="stat-title">Total Skincare Offline</div>
          <div class="stat-value">Rp ${totalOffline.toLocaleString('id-ID')}</div>
        </div>
        <div class="stat-card" style="border-top: 4px solid var(--success)">
          <div class="stat-title">Total Skincare Online</div>
          <div class="stat-value">Rp ${totalOnline.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Riwayat Seluruh Transaksi</h2>
        </div>
        <div class="panel-body" style="padding:0; overflow-x:auto;">
          <table class="data-table" style="min-width: 800px;">
            <thead><tr><th>Waktu & Tanggal</th><th>Nomor Ref</th><th>Jenis Transaksi</th><th>Metode Pembayaran</th><th>Kasir / Admin</th><th>Total (Rp)</th></tr></thead>
            <tbody>
              ${tx.length === 0 ? '<tr><td colspan="6" style="text-align:center;">Belum ada data keuangan.</td></tr>' : 
                tx.slice().reverse().map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td><strong>${t.id}</strong></td>
                  <td><span class="status status-info">${t.type}</span></td>
                  <td><strong>${t.method || 'Cash'}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; background:#e2e8f0; border-radius:4px;">${t.admin || '-'}</span></td>
                  <td style="font-weight:bold; color:var(--success);">Rp ${t.total.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }
};

// --- INITIALIZE ROUTER ---
function loadView(viewId) {
  navItems.forEach(item => item.classList.remove('active'));
  const activeNav = document.querySelector(`[data-target="${viewId}"]`);
  if(activeNav) activeNav.classList.add('active');

  const contentFunc = views[viewId];
  contentArea.innerHTML = contentFunc ? contentFunc() : `<div class="fade-in"><div class="panel-body"><h1>Halaman ${viewId}</h1></div></div>`;
  
  // Set default dropdown selections based on current logged in user
  const adminSelects = document.querySelectorAll('select[id$="-admin"]');
  adminSelects.forEach(sel => {
    // Only auto-select if the user is in the options (e.g. Owner won't match Kasir options if we strictly check, but we have full list)
    // Actually our adminOptions includes everything, so this is safe:
    Array.from(sel.options).forEach(opt => {
      if(opt.value === window.CURRENT_USER || (window.CURRENT_USER.includes(opt.value))) {
        sel.value = opt.value;
      }
    });
  });
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    loadView(item.getAttribute('data-target'));
  });
});

ctrl.changeRole(); // Init RBAC
loadView('dashboard');

// --- REALTIME CLOCK ---
function updateDateTime() {
  const dt = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const day = days[dt.getDay()];
  const date = dt.getDate();
  const month = months[dt.getMonth()];
  const year = dt.getFullYear();
  const h = String(dt.getHours()).padStart(2, '0');
  const m = String(dt.getMinutes()).padStart(2, '0');
  
  const timeStr = `${day}, ${date} ${month} ${year} ${h}:${m}`;
  const el = document.getElementById('current-datetime');
  if(el) el.innerText = timeStr;
}
setInterval(updateDateTime, 1000);
updateDateTime();
