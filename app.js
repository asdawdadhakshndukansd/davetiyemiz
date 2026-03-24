const SUPABASE_URL = "https://wjwwzjsnnivapoforgre.supabase.co";
const SUPABASE_KEY = "sb_publishable_15F4UMrjq92WDpV9iXqRCA_1k83xNiY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const gunEl = document.getElementById("gun");
const saatEl = document.getElementById("saat");
const dakikaEl = document.getElementById("dakika");
const saniyeEl = document.getElementById("saniye");

const openMemory = document.getElementById("openMemory");
const closeSheet = document.getElementById("closeSheet");
const sheetOverlay = document.getElementById("sheetOverlay");

const photoTab = document.getElementById("photoTab");
const audioTab = document.getElementById("audioTab");
const videoTab = document.getElementById("videoTab");

const photoPanel = document.getElementById("photoPanel");
const audioPanel = document.getElementById("audioPanel");
const videoPanel = document.getElementById("videoPanel");

const fileInput = document.getElementById("fileInput");
const fileNameText = document.getElementById("fileNameText");

const videoInput = document.getElementById("videoInput");
const videoNameText = document.getElementById("videoNameText");

const startRecord = document.getElementById("startRecord");
const stopRecord = document.getElementById("stopRecord");
const recordText = document.getElementById("recordText");
const audioPreview = document.getElementById("audioPreview");

const sendBtn = document.getElementById("sendBtn");
const resultMsg = document.getElementById("resultMsg");
const nameInput = document.getElementById("nameInput");

const konumLink = document.querySelector(".konum");
const instagramLink = document.querySelector(".instagram");
const whatsappLink = document.querySelector(".whatsapp");

const hedefTarih = new Date("2026-03-28T20:00:00+03:00");

let currentType = "photo";
let mediaRecorder = null;
let currentStream = null;
let audioChunks = [];
let audioBlob = null;

let selectedPhotos = [];
let selectedVideos = [];
let videoDurations = [];

function ikiBasamak(sayi) {
  return String(sayi).padStart(2, "0");
}

function sayaciGuncelle() {
  if (!gunEl || !saatEl || !dakikaEl || !saniyeEl) return;

  const simdi = new Date();
  const fark = hedefTarih - simdi;

  if (fark <= 0) {
    gunEl.textContent = "00";
    saatEl.textContent = "00";
    dakikaEl.textContent = "00";
    saniyeEl.textContent = "00";
    return;
  }

  const toplamSaniye = Math.floor(fark / 1000);

  const gun = Math.floor(toplamSaniye / 86400);
  const saat = Math.floor((toplamSaniye % 86400) / 3600);
  const dakika = Math.floor((toplamSaniye % 3600) / 60);
  const saniye = toplamSaniye % 60;

  gunEl.textContent = ikiBasamak(gun);
  saatEl.textContent = ikiBasamak(saat);
  dakikaEl.textContent = ikiBasamak(dakika);
  saniyeEl.textContent = ikiBasamak(saniye);
}

function sheetAc() {
  if (!sheetOverlay) return;
  sheetOverlay.classList.add("active");
  sheetOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function sheetKapat() {
  if (!sheetOverlay) return;
  sheetOverlay.classList.remove("active");
  sheetOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function sekmeyiGoster(type) {
  currentType = type;

  if (photoTab) photoTab.classList.toggle("active", type === "photo");
  if (audioTab) audioTab.classList.toggle("active", type === "audio");
  if (videoTab) videoTab.classList.toggle("active", type === "video");

  if (photoPanel) photoPanel.classList.toggle("hidden", type !== "photo");
  if (audioPanel) audioPanel.classList.toggle("hidden", type !== "audio");
  if (videoPanel) videoPanel.classList.toggle("hidden", type !== "video");

  if (resultMsg) resultMsg.textContent = "";
}

function mikrofonAkisiniKapat() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
}

function guvenliIsimOlustur(isim) {
  return (isim || "misafir").replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_-]/g, "_");
}

if (openMemory) {
  openMemory.addEventListener("click", sheetAc);
}

if (closeSheet) {
  closeSheet.addEventListener("click", sheetKapat);
}

if (sheetOverlay) {
  sheetOverlay.addEventListener("click", (event) => {
    if (event.target === sheetOverlay) {
      sheetKapat();
    }
  });
}

if (photoTab) {
  photoTab.addEventListener("click", () => sekmeyiGoster("photo"));
}

if (audioTab) {
  audioTab.addEventListener("click", () => sekmeyiGoster("audio"));
}

if (videoTab) {
  videoTab.addEventListener("click", () => sekmeyiGoster("video"));
}

if (fileInput) {
  fileInput.addEventListener("change", () => {
    selectedPhotos = Array.from(fileInput.files || []);

    if (fileNameText) {
      if (selectedPhotos.length === 0) {
        fileNameText.textContent = "Henüz fotoğraf seçilmedi";
      } else if (selectedPhotos.length === 1) {
        fileNameText.textContent = `Seçilen fotoğraf: ${selectedPhotos[0].name}`;
      } else {
        fileNameText.textContent = `${selectedPhotos.length} fotoğraf seçildi`;
      }
    }

    if (resultMsg) {
      resultMsg.textContent = "";
    }
  });
}

if (!window.MediaRecorder && recordText) {
  recordText.textContent = "Bu cihazda ses kaydı desteklenmiyor.";

  if (startRecord) startRecord.disabled = true;
  if (stopRecord) stopRecord.disabled = true;
}

if (startRecord) {
  startRecord.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentStream = stream;

      audioChunks = [];
      audioBlob = null;

      if (audioPreview) {
        audioPreview.src = "";
        audioPreview.classList.add("hidden");
      }

      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType || "audio/webm"
        });

        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioPreview) {
          audioPreview.src = audioUrl;
          audioPreview.classList.remove("hidden");
        }

        if (recordText) {
          recordText.textContent = "Kayıt hazır";
        }

        mikrofonAkisiniKapat();
      };

      mediaRecorder.start();

      if (recordText) {
        recordText.textContent = "Kayıt yapılıyor...";
      }

      startRecord.disabled = true;
      if (stopRecord) stopRecord.disabled = false;

      if (resultMsg) {
        resultMsg.textContent = "";
      }
    } catch (error) {
      console.error(error);
      mikrofonAkisiniKapat();

      if (recordText) {
        recordText.textContent = "Mikrofon izni verilmedi.";
      }
    }
  });
}

if (stopRecord) {
  stopRecord.addEventListener("click", () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    mediaRecorder.stop();

    if (startRecord) startRecord.disabled = false;
    stopRecord.disabled = true;

    if (recordText) {
      recordText.textContent = "Kayıt durduruldu";
    }
  });
}

if (videoInput) {
  videoInput.addEventListener("change", async () => {
    const files = Array.from(videoInput.files || []);
    selectedVideos = [];
    videoDurations = [];

    if (files.length === 0) {
      if (videoNameText) {
        videoNameText.textContent = "Henüz video seçilmedi";
      }
      return;
    }

    try {
      for (const file of files) {
        const duration = await new Promise((resolve, reject) => {
          const tempVideo = document.createElement("video");
          const objectUrl = URL.createObjectURL(file);

          tempVideo.preload = "metadata";
          tempVideo.src = objectUrl;

          tempVideo.onloadedmetadata = () => {
            const d = tempVideo.duration;
            URL.revokeObjectURL(objectUrl);
            resolve(d);
          };

          tempVideo.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`${file.name} için video bilgisi okunamadı.`));
          };
        });

        if (duration > 60) {
          if (resultMsg) {
            resultMsg.textContent = `"${file.name}" 60 saniyeyi geçiyor.`;
          }

          videoInput.value = "";
          selectedVideos = [];
          videoDurations = [];

          if (videoNameText) {
            videoNameText.textContent = "Henüz video seçilmedi";
          }
          return;
        }

        selectedVideos.push(file);
        videoDurations.push(duration);
      }

      if (videoNameText) {
        if (selectedVideos.length === 1) {
          videoNameText.textContent = `Seçilen video: ${selectedVideos[0].name}`;
        } else {
          videoNameText.textContent = `${selectedVideos.length} video seçildi`;
        }
      }

      if (resultMsg) {
        resultMsg.textContent = "";
      }
    } catch (error) {
      console.error(error);

      videoInput.value = "";
      selectedVideos = [];
      videoDurations = [];

      if (videoNameText) {
        videoNameText.textContent = "Henüz video seçilmedi";
      }

      if (resultMsg) {
        resultMsg.textContent = error.message || "Video bilgisi okunamadı.";
      }
    }
  });
}

if (sendBtn) {
  sendBtn.addEventListener("click", async () => {
    if (!resultMsg) return;

    resultMsg.textContent = "Gönderiliyor...";
    sendBtn.disabled = true;

    try {
      const guestName = nameInput?.value?.trim() || "misafir";
      const safeName = guvenliIsimOlustur(guestName);

      const hasPhotos = selectedPhotos.length > 0;
      const hasAudio = !!audioBlob;
      const hasVideos = selectedVideos.length > 0;

      if (!hasPhotos && !hasAudio && !hasVideos) {
        resultMsg.textContent =
          "Lütfen en az bir fotoğraf, sesli not veya video ekleyin.";
        sendBtn.disabled = false;
        return;
      }

      let uploadedItems = [];

      if (hasPhotos) {
        for (let i = 0; i < selectedPhotos.length; i++) {
          const photo = selectedPhotos[i];

          resultMsg.textContent = `Fotoğraflar yükleniyor: ${i + 1} / ${selectedPhotos.length}`;

          const fileExt = photo.name.split(".").pop() || "jpg";
          const filePath = `photo/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}-${safeName}.${fileExt}`;

          const { error } = await supabaseClient.storage
            .from("anilar")
            .upload(filePath, photo, {
              cacheControl: "3600",
              upsert: false
            });

          if (error) throw error;
        }

        uploadedItems.push(
          selectedPhotos.length === 1
            ? "1 fotoğraf"
            : `${selectedPhotos.length} fotoğraf`
        );
      }

      if (hasAudio) {
        resultMsg.textContent = "Sesli not yükleniyor...";

        const filePath = `audio/${Date.now()}-${safeName}.webm`;

        const { error } = await supabaseClient.storage
          .from("anilar")
          .upload(filePath, audioBlob, {
            contentType: audioBlob.type || "audio/webm",
            cacheControl: "3600",
            upsert: false
          });

        if (error) throw error;
        uploadedItems.push("1 sesli not");
      }

      if (hasVideos) {
        for (let i = 0; i < selectedVideos.length; i++) {
          const video = selectedVideos[i];
          const duration = videoDurations[i];

          if (duration > 60) {
            resultMsg.textContent = `"${video.name}" 60 saniyeyi geçemez.`;
            sendBtn.disabled = false;
            return;
          }

          resultMsg.textContent = `Videolar yükleniyor: ${i + 1} / ${selectedVideos.length}`;

          const fileExt = video.name.split(".").pop() || "mp4";
          const filePath = `video/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}-${safeName}.${fileExt}`;

          const { error } = await supabaseClient.storage
            .from("anilar")
            .upload(filePath, video, {
              cacheControl: "3600",
              upsert: false
            });

          if (error) throw error;
        }

        uploadedItems.push(
          selectedVideos.length === 1
            ? "1 video"
            : `${selectedVideos.length} video`
        );
      }

      resultMsg.textContent = `Teşekkürler, ${uploadedItems.join(", ")} alındı.`;

      selectedPhotos = [];
      if (fileInput) fileInput.value = "";
      if (fileNameText) fileNameText.textContent = "Henüz fotoğraf seçilmedi";

      audioBlob = null;
      if (audioPreview) {
        audioPreview.src = "";
        audioPreview.classList.add("hidden");
      }
      if (recordText) {
        recordText.textContent = "Hazır";
      }

      selectedVideos = [];
      videoDurations = [];
      if (videoInput) videoInput.value = "";
      if (videoNameText) {
        videoNameText.textContent = "Henüz video seçilmedi";
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
      resultMsg.textContent = `Hata: ${error.message || "Yükleme başarısız."}`;
    } finally {
      sendBtn.disabled = false;
    }
  });
}

function baslat() {
  sekmeyiGoster("photo");
  sayaciGuncelle();
  setInterval(sayaciGuncelle, 1000);
}

if (konumLink) {
  konumLink.addEventListener("click", () => {
    console.log("Konum tıklandı");
  });
}

if (instagramLink) {
  instagramLink.addEventListener("click", () => {
    console.log("Instagram tıklandı");
  });
}

if (whatsappLink) {
  whatsappLink.addEventListener("click", () => {
    console.log("WhatsApp tıklandı");
  });
}

window.addEventListener("load", baslat);
window.addEventListener("beforeunload", mikrofonAkisiniKapat);