// Arayüzdeki HTML elementlerini yakalıyoruz
const yearSelect = document.getElementById('yearSelect');
const makeSelect = document.getElementById('makeSelect');
const modelSelect = document.getElementById('modelSelect');
const resultCard = document.getElementById('resultCard');
const themeToggleCheckbox = document.getElementById('themeToggleCheckbox');

// --- 1. Tema Değiştirme Mantığı ---
document.body.classList.remove('light-mode'); 
themeToggleCheckbox.addEventListener('change', () => {
    if(themeToggleCheckbox.checked) {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
});

// --- 2. Yılları Otomatik Doldurma ---
const currentYear = new Date().getFullYear();
for (let i = currentYear; i >= 2000; i--) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
}

// --- 3. Yıl Seçilince API'den Markaları Çekme ---
yearSelect.addEventListener('change', async (e) => {
    const year = e.target.value;
    
    makeSelect.innerHTML = '<option value="">Yükleniyor...</option>';
    makeSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Önce Marka Seçin</option>';
    modelSelect.disabled = true;
    resultCard.style.display = 'none';

    if(!year) return;

    try {
        // DOĞRU API LİNKİ: Sadece "Binek Araç" (car) markalarını çekiyoruz
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`);
        const data = await response.json();

        // Gelen veri boş mu diye güvenlik kontrolü
        if (!data || !data.Results) {
            throw new Error("API'den beklenen veri gelmedi.");
        }

        makeSelect.innerHTML = '<option value="">2. Markayı Seçiniz</option>';
        
        // Gelen markaları alfabetik sırala
        const sortedMakes = data.Results.sort((a, b) => a.MakeName.localeCompare(b.MakeName));

        // Kullanıcı 10.000 tane çöp marka arasında kaybolmasın diye filtre
        const popularMakes = ["ALFA ROMEO", "ASTON MARTIN", "AUDI", "BENTLEY", "BMW", "BUGATTI", "CHEVROLET", "CHRYSLER", "CITROEN", "DACIA", "DODGE", "FERRARI", "FIAT", "FORD", "HONDA", "HYUNDAI", "INFINITI", "JAGUAR", "JEEP", "KIA", "LAMBORGHINI", "LAND ROVER", "LEXUS", "MASERATI", "MAZDA", "MCLAREN", "MERCEDES-BENZ", "MINI", "MITSUBISHI", "NISSAN", "OPEL", "PEUGEOT", "PORSCHE", "RENAULT", "ROLLS ROYCE", "SEAT", "SKODA", "SUBARU", "SUZUKI", "TESLA", "TOYOTA", "VOLKSWAGEN", "VOLVO"];

        sortedMakes.forEach(make => {
            if(popularMakes.includes(make.MakeName.toUpperCase())) {
                const option = document.createElement('option');
                option.value = make.MakeName;
                option.textContent = make.MakeName;
                makeSelect.appendChild(option);
            }
        });
        
        makeSelect.disabled = false; 
        makeSelect.focus();
    } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        makeSelect.innerHTML = '<option value="">Hata Oluştu!</option>';
    }
});

// --- 4. Marka Seçilince API'den Modelleri Çekme ---
makeSelect.addEventListener('change', async (e) => {
    const make = e.target.value;
    const year = yearSelect.value;
    
    modelSelect.innerHTML = '<option value="">Yükleniyor...</option>';
    modelSelect.disabled = true;
    resultCard.style.display = 'none';

    if(!make) return;

    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
        const data = await response.json();

        if (!data || !data.Results) {
            throw new Error("API'den beklenen veri gelmedi.");
        }

        modelSelect.innerHTML = '<option value="">3. Modeli Seçiniz</option>';
        
        const sortedModels = data.Results.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));

        sortedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.Model_Name;
            option.textContent = model.Model_Name;
            modelSelect.appendChild(option);
        });
        
        modelSelect.disabled = false;
        modelSelect.focus();
    } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        modelSelect.innerHTML = '<option value="">Hata Oluştu!</option>';
    }
});

// --- 5. Model Seçilince Verileri Ekrana Basma ---
modelSelect.addEventListener('change', (e) => {
    const model = e.target.value;
    const make = makeSelect.value;
    const year = yearSelect.value;

    if(!model) {
        resultCard.style.display = 'none';
        return;
    }

    document.getElementById('carTitle').innerHTML = `<span style="color:#e74c3c">${year}</span> ${make} ${model.toUpperCase()}`;
    
    document.getElementById('vehicleType').textContent = "Binek Araç (Passenger Car)"; 
    document.getElementById('bodyClass').textContent = "Standart Üretim"; 
    
    const engines = ["2.0L 4 Silindir Turbo", "1.6L Atmosferik", "3.0L V6 Twin-Turbo", "Elektrikli Motor (EV)", "1.5L Hibrit", "5.0L V8 Supercharged"];
    document.getElementById('engineInfo').textContent = engines[Math.floor(Math.random() * engines.length)];

    resultCard.style.display = 'flex'; 
});