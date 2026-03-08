import type { SurveyQuestion, SurveySection } from "@/lib/survey/types";

export const surveySections: SurveySection[] = [
  {
    id: "profile",
    eyebrow: "01",
    title: "Operasyon Profili",
    description: "Firmanizin depo yapisini, urun yogunlugunu ve ekip olcegini anlayalim."
  },
  {
    id: "processes",
    eyebrow: "02",
    title: "Surec Oncelikleri",
    description: "Hangi ambar kabiliyetlerinin ilk surumde kritik oldugunu netlestirelim."
  },
  {
    id: "inventory",
    eyebrow: "03",
    title: "Stok ve Lokasyon",
    description: "Izlenebilirlik, raf yapisi ve sayim rutininizi buna gore sekillendirelim."
  },
  {
    id: "users",
    eyebrow: "04",
    title: "Kullanici ve Yetki",
    description: "Kimin hangi ekranda ne gorecegini, neyi onaylayacagini cikaralim."
  },
  {
    id: "integrations",
    eyebrow: "05",
    title: "Entegrasyon ve Cihaz",
    description: "Sahadaki barkod, yazici ve ERP ihtiyacini tasarimin merkezine alalim."
  },
  {
    id: "timeline",
    eyebrow: "06",
    title: "Takvim ve Iletisim",
    description: "Devreye alma temposunu ve size donecek kesif surecini planlayalim."
  }
];

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "companyName",
    sectionId: "profile",
    label: "Firma adi",
    placeholder: "Ornek: Aydin Lojistik",
    type: "text",
    required: true
  },
  {
    id: "industry",
    sectionId: "profile",
    label: "Faaliyet alani",
    type: "radio",
    required: true,
    options: [
      { value: "uretim", label: "Uretim ve dagitim" },
      { value: "e-ticaret", label: "E-ticaret ve fulfillment" },
      { value: "gida", label: "Gida ve hizli tuketim" },
      { value: "saglik", label: "Saglik ve medikal" },
      { value: "insaat", label: "Insaat ve saha lojistigi" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "warehouseCount",
    sectionId: "profile",
    label: "Kac depo veya ana stok noktasi yonetiyorsunuz?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "Tek depo" },
      { value: "2-3", label: "2 ila 3 depo" },
      { value: "4+", label: "4 ve uzeri lokasyon" }
    ]
  },
  {
    id: "skuRange",
    sectionId: "profile",
    label: "Yaklasik urun cesitliligi",
    type: "radio",
    required: true,
    options: [
      { value: "0-200", label: "0 ila 200 SKU" },
      { value: "200-1000", label: "200 ila 1000 SKU" },
      { value: "1000-5000", label: "1000 ila 5000 SKU" },
      { value: "5000+", label: "5000+ SKU" }
    ]
  },
  {
    id: "userCount",
    sectionId: "profile",
    label: "Sistemi aktif kullanacak kisi sayisi",
    type: "radio",
    required: true,
    options: [
      { value: "1-3", label: "1 ila 3 kisi" },
      { value: "4-10", label: "4 ila 10 kisi" },
      { value: "11-25", label: "11 ila 25 kisi" },
      { value: "25+", label: "25+ kisi" }
    ]
  },
  {
    id: "modules",
    sectionId: "processes",
    label: "Ilk surumde hangi moduller olmazsa olmaz?",
    description: "Birden fazla secim yapabilirsiniz.",
    type: "multi-select",
    required: true,
    options: [
      { value: "urun", label: "Urun kartlari" },
      { value: "stok", label: "Stok giris-cikis" },
      { value: "lokasyon", label: "Depo ve raf lokasyonu" },
      { value: "barkod", label: "Barkod ve etiket" },
      { value: "tedarikci", label: "Tedarikci ve satin alma" },
      { value: "sevkiyat", label: "Sevkiyat ve cikis fisleri" },
      { value: "sayim", label: "Sayim ve envanter farklari" },
      { value: "raporlama", label: "Raporlama ve kritik stok" },
      { value: "yetki", label: "Rol ve yetki yonetimi" },
      { value: "diger", label: "Eklemek istediginiz var mi?" }
    ]
  },
  {
    id: "painPoints",
    sectionId: "processes",
    label: "Bugun en cok zorlandiginiz alanlar neler?",
    description: "Bu secim, anket ozetindeki cozum tavsiyesini sekillendirir.",
    type: "multi-select",
    options: [
      { value: "manuel", label: "Excel ve manuel takiple ilerliyoruz" },
      { value: "gorus", label: "Anlik stok gorunurlugu zayif" },
      { value: "hata", label: "Giris-cikis hatalari yuksek" },
      { value: "sayim", label: "Sayim farklarini yonetmek zor" },
      { value: "yetki", label: "Kim ne yaptiyi takip etmek istiyoruz" },
      { value: "entegrasyon", label: "ERP veya muhasebe ile veri kopuk" },
      { value: "diger", label: "Eklemek istediginiz var mi?" }
    ]
  },
  {
    id: "trackingNeeds",
    sectionId: "inventory",
    label: "Stok takibinde hangi detaylara ihtiyaciniz var?",
    description: "Birden fazla secim yapabilirsiniz.",
    type: "multi-select",
    required: true,
    options: [
      { value: "miktar", label: "Sadece miktar takibi" },
      { value: "lot", label: "Parti veya lot takibi" },
      { value: "seri", label: "Seri numarasi takibi" },
      { value: "skt", label: "Son kullanma tarihi takibi" },
      { value: "diger", label: "Eklemek istediginiz var mi?" }
    ]
  },
  {
    id: "locationMode",
    sectionId: "inventory",
    label: "Lokasyon derinligi ne seviyede olmali?",
    type: "radio",
    required: true,
    visibleWhen: [
      { field: "modules", includes: "lokasyon" }
    ],
    options: [
      { value: "depo", label: "Depo bazinda yeterli" },
      { value: "raf", label: "Raf ve goz bazli izleme gerekli" },
      { value: "palet", label: "Palet ve hucre bazli detay istiyoruz" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "transferNeed",
    sectionId: "inventory",
    label: "Depolar arasi transfer sureci gerekiyor mu?",
    type: "radio",
    required: true,
    visibleWhen: [
      { field: "warehouseCount", isOneOf: ["2-3", "4+"] }
    ],
    options: [
      { value: "evet", label: "Evet, duzenli transfer var" },
      { value: "nadiren", label: "Bazen gerekiyor" },
      { value: "hayir", label: "Hayir, her depo bagimsiz" }
    ]
  },
  {
    id: "countFrequency",
    sectionId: "inventory",
    label: "Sayim sikliginiz nasil olmali?",
    type: "radio",
    required: true,
    visibleWhen: [
      { field: "modules", includes: "sayim" }
    ],
    options: [
      { value: "ad-hoc", label: "Ihtiyac oldugunda" },
      { value: "monthly", label: "Aylik periyodik sayim" },
      { value: "cycle", label: "Surekli cycle count yapisi" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "roleModel",
    sectionId: "users",
    label: "Yetki modeli nasil olmali?",
    type: "radio",
    required: true,
    visibleWhen: [
      { field: "modules", includes: "yetki" }
    ],
    options: [
      { value: "basic", label: "Admin / depo sorumlusu / personel" },
      { value: "advanced", label: "Departman ve gorev bazli detayli rol" },
      { value: "viewer", label: "Goruntuleyici profili de gerekli" }
    ]
  },
  {
    id: "approvalNeed",
    sectionId: "users",
    label: "Onay mekanizmasi gerekli mi?",
    type: "radio",
    required: true,
    visibleWhen: [
      { field: "userCount", isOneOf: ["4-10", "11-25", "25+"] }
    ],
    options: [
      { value: "evet", label: "Evet, kritik islemler onaya dusmeli" },
      { value: "log", label: "Onaydan cok audit log yeterli" },
      { value: "hayir", label: "Hayir, hizli operasyon daha onemli" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "integrations",
    sectionId: "integrations",
    label: "Hangi entegrasyon veya cihazlar planin bir parcasi olmali?",
    description: "Birden fazla secim yapabilirsiniz.",
    type: "multi-select",
    required: true,
    options: [
      { value: "excel", label: "Excel ice / disa aktarim" },
      { value: "barcode_reader", label: "Barkod okuyucu" },
      { value: "label_printer", label: "Etiket veya fis yazicisi" },
      { value: "erp", label: "ERP entegrasyonu" },
      { value: "accounting", label: "Muhasebe entegrasyonu" },
      { value: "diger", label: "Eklemek istediginiz var mi?" }
    ]
  },
  {
    id: "barcodeHardware",
    sectionId: "integrations",
    label: "Barkod tarafinda hangi seviye gerekiyor?",
    type: "multi-select",
    visibleWhen: [
      { field: "integrations", includes: "barcode_reader" }
    ],
    options: [
      { value: "handheld", label: "El terminali veya okutucu" },
      { value: "label", label: "Etiket basim akisi" },
      { value: "mobile", label: "Mobil cihaz kamerasiyla okutma" },
      { value: "diger", label: "Eklemek istediginiz var mi?" }
    ]
  },
  {
    id: "printerNeed",
    sectionId: "integrations",
    label: "Yazici tarafinda beklenti nedir?",
    type: "radio",
    visibleWhen: [
      { field: "integrations", includes: "label_printer" }
    ],
    options: [
      { value: "label", label: "Sadece etiket ve raf etiketi" },
      { value: "form", label: "Fis ve sevk evraki" },
      { value: "both", label: "Her ikisi de gerekli" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "erpName",
    sectionId: "integrations",
    label: "ERP veya muhasebe sistemi adi",
    type: "text",
    placeholder: "Ornek: Logo, Netsis, SAP, Mikro",
    visibleWhen: [
      { field: "integrations", includes: "erp" }
    ]
  },
  {
    id: "priority",
    sectionId: "timeline",
    label: "Bu projede baskin hedefiniz nedir?",
    type: "radio",
    required: true,
    options: [
      { value: "speed", label: "Hizli devreye alma" },
      { value: "control", label: "Operasyonel kontrol ve izlenebilirlik" },
      { value: "growth", label: "Buyumeye hazir altyapi" },
      { value: "diger", label: "Diger" }
    ]
  },
  {
    id: "launchWindow",
    sectionId: "timeline",
    label: "Hedef baslangic zamani",
    type: "radio",
    required: true,
    options: [
      { value: "0-1", label: "0 ila 1 ay" },
      { value: "1-3", label: "1 ila 3 ay" },
      { value: "3-6", label: "3 ila 6 ay" },
      { value: "6+", label: "6 ay ve sonrasi" }
    ]
  },
  {
    id: "notes",
    sectionId: "timeline",
    label: "Ek notlariniz",
    description: "Mevcut sistem, ozel akis veya kritik bir beklenti varsa yazabilirsiniz.",
    type: "textarea",
    placeholder: "Ornek: Soguk hava deposu var, raf bazli lot takibi istiyoruz."
  },
  {
    id: "contactName",
    sectionId: "timeline",
    label: "Iletisim kurulacak kisi",
    type: "text",
    required: true,
    placeholder: "Ad Soyad"
  },
  {
    id: "contactEmail",
    sectionId: "timeline",
    label: "E-posta",
    type: "email",
    required: true,
    placeholder: "ornek@firma.com"
  },
  {
    id: "contactPhone",
    sectionId: "timeline",
    label: "Telefon",
    type: "tel",
    required: true,
    placeholder: "+90 5xx xxx xx xx"
  }
];





