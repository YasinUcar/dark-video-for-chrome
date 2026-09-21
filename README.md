# Video Karanlık Mod (Chrome Uzantısı)

Video oynatan sayfalarda (YouTube, Udemy, vb.) videonun kendi içeriği açık/beyaz
arka planlıysa (ör. beyaz temalı kod ekranı, beyaz slayt), videoyu otomatik olarak
karanlığa çevirir. Sayfanın geri kalanına dokunmaz, sadece `<video>` etiketine CSS
filtresi uygular.

## Nasıl çalışır?
- Video oynarken küçük bir canvas'a periyodik olarak bir kare çizilip ortalama
  parlaklığı ölçülür.
- Parlaklık eşiği aşarsa (varsayılan: 140/255) videoya `invert(1) hue-rotate(180deg)`
  filtresi uygulanır — kod/ekran görüntüsü videoları için en doğal sonucu bu verir.
  İstersen ayarlardan "karart" moduna geçebilirsin (renkli/gerçek görüntülü video
  için daha uygun, ters çevirme yapmaz sadece parlaklığı düşürür).

## Kurulum (paketlenmemiş / unpacked)
1. Zip dosyasını bir klasöre çıkar.
2. Chrome'da `chrome://extensions` adresine git.
3. Sağ üstten "Geliştirici modu"nu aç.
4. "Paketlenmemiş öğe yükle" (Load unpacked) butonuna tıkla ve çıkardığın klasörü seç.
5. Sağ üstteki uzantı simgesine tıklayarak ayarları aç.

## Önemli sınırlama (tarayıcı güvenliği)
Bazı sitelerde (özellikle YouTube ve DRM korumalı içerikler — Netflix, bazı Udemy
oynatıcıları vb.) tarayıcı, videonun piksellerini JavaScript ile okumayı güvenlik
gereği (CORS / DRM) tamamen engeller. Bu durumda otomatik algılama o video için
çalışmaz — bu bir hata değil, tarayıcının kasıtlı güvenlik kısıtlaması ve bir
uzantının bunu aşması mümkün değil.

Bu gibi durumlarda:
- Popup'tan "Otomatik algıla"yı kapatıp videoyu her zaman seçili modda gösterebilirsin, ya da
- `Alt+Shift+D` kısayoluyla o sayfadaki videoyu anında elle aç/kapat yapabilirsin
  (kısayolu `chrome://extensions/shortcuts` sayfasından değiştirebilirsin).

## Ayarlar (uzantı simgesine tıkla)
- **Genel aç/kapat**: Uzantıyı tamamen devre dışı bırakır.
- **Otomatik algıla**: Açıkken parlaklığa göre karar verir; kapalıyken sitede her
  zaman seçili modu uygular.
- **Hassasiyet**: Eşik değeri ne kadar düşükse o kadar çabuk "açık arka plan" sayılır.
- **Ters çevir / Karart**: İki farklı karanlık mod stratejisi.
- **Bu sitede kapat**: Sadece geçerli alan adında uzantıyı devre dışı bırakır
  (ör. film izlediğin bir sitede rengi bozmasın istersen).

## Dosyalar
- `manifest.json` — uzantı tanımı (Manifest V3)
- `content.js` — video tespiti, parlaklık ölçümü, filtre uygulama
- `content.css` — karanlık filtre sınıfları
- `background.js` — kurulum ve klavye kısayolu
- `popup.html / popup.css / popup.js` — ayarlar arayüzü
- `icons/` — uzantı ikonları
