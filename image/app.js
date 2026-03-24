const giris = document.getElementById("giris");
const davet = document.getElementById("davet");
const muhur = document.getElementById("muhur");
const sayac = document.getElementById("sayac");

muhur.addEventListener("click", () => {
  giris.classList.remove("aktif");
  davet.classList.add("aktif");
});

const hedefTarih = new Date("2026-03-28T18:00:00+03:00");

function ikiBasamak(sayi){
  return String(sayi).padStart(2, "0");
}

function sayaciGuncelle(){
  const simdi = new Date();
  const fark = hedefTarih - simdi;

  if(fark <= 0){
    sayac.textContent = "Başladı";
    return;
  }

  const toplamSaniye = Math.floor(fark / 1000);
  const gun = Math.floor(toplamSaniye / 86400);
  const saat = Math.floor((toplamSaniye % 86400) / 3600);
  const dakika = Math.floor((toplamSaniye % 3600) / 60);
  const saniye = toplamSaniye % 60;

  sayac.textContent = `${gun}g ${ikiBasamak(saat)}:${ikiBasamak(dakika)}:${ikiBasamak(saniye)}`;
}

sayaciGuncelle();
setInterval(sayaciGuncelle, 1000);