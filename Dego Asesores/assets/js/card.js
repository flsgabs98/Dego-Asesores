// ---------- vCard generation ----------
const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Flores Cruz;Benjamin;;;',
  'FN:Benjamin Flores Cruz',
  'ORG:DEGO Asesores',
  'TITLE:Asesor Patrimonial y de Seguros',
  'TEL;TYPE=CELL,WHATSAPP:+525575058869',
  'EMAIL;TYPE=WORK:degoasesores@gmail.com',
  'ADR;TYPE=WORK:;;Av. Revolución 507, San Pedro de los Pinos;Ciudad de México;;;México',
  'URL:https://www.facebook.com/share/1B92gb3UG7/?mibextid=wwXIfr',
  'NOTE:Asesor de seguros y protección patrimonial en DEGO Asesores.',
  'END:VCARD'
].join('\n');

function downloadVCard() {
  const blob = new Blob([VCARD], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Benjamin-Flores-Cruz-DEGO-Asesores.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Contacto descargado');
}

const saveBtn = document.getElementById('saveContactBtn');
if (saveBtn) saveBtn.addEventListener('click', downloadVCard);

// ---------- QR code (encodes the vCard directly, works without hosting) ----------
const qrImg = document.getElementById('qrImg');
if (qrImg) {
  const qrData = encodeURIComponent(VCARD);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=6&data=${qrData}`;
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4 10-10"/></svg><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('span').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ---------- Copy phone / share ----------
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Benjamin Flores Cruz | DEGO Asesores',
      text: 'Contacta a Benjamin Flores Cruz, Asesor Patrimonial y de Seguros en DEGO Asesores.',
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Enlace copiado');
      } catch (e) {
        showToast('No se pudo copiar el enlace');
      }
    }
  });
}

// ---------- Card tilt ----------
const dcard = document.getElementById('dcard');
if (dcard) {
  dcard.addEventListener('mousemove', (e) => {
    const rect = dcard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    dcard.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  dcard.addEventListener('mouseleave', () => {
    dcard.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}
