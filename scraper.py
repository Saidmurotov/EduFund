import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
import re
import time
import os
import json

# ==========================================
# FIREBASE SOZLAMALARI (Yo'riqnoma):
# 1. Firebase Console (console.firebase.google.com) ga kiring.
# 2. Project Settings -> Service Accounts bo'limiga kiring.
# 3. "Generate new private key" tugmasini bosib JSON faylni yuklab oling.
# 4. JSON fayl nomini `serviceAccountKey.json` deb o'zgartiring va bevosita ushbu papkaga tashlang.
# ==========================================

print("🔥 Firebase'ga ulanish boshlanmoqda...")
try:
    # GitHub Actions orqali yuborilganda env variable dan o'qiymiz
    env_cred = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
    if env_cred:
        cred_dict = json.loads(env_cred)
        cred = credentials.Certificate(cred_dict)
    else:
        # Lokal muhit uchun fayldan o'qiymiz
        cred = credentials.Certificate('serviceAccountKey.json')
        
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("☑️ Firebase'ga muvaffaqiyatli ulandi.")
except Exception as e:
    print(f"❌ XATOLIK: Firebase ulanishida muammo.\nBatafsil: {e}")
    exit(1)

def get_existing_links():
    """Bazada mavjud bo'lgan grant havolalarini(url) oladi."""
    existing_links = set()
    try:
        docs = db.collection('grants').select(['sourceUrl']).stream()
        for doc in docs:
            data = doc.to_dict()
            if 'sourceUrl' in data:
                existing_links.add(data['sourceUrl'])
    except Exception as e:
        print(f"Bazada o'qishda xatolik: {e}")
    return existing_links

def extract_deadline_and_category(url):
    """Har bir grant ichiga kirib deadline va yo'nalishni o'qiydi."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    details = {
        "deadline": "",
        "category": "All Fields",
        "min_gpa": 0.0
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return details
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Odatda Grantlar.uz da deadline ma'lumotlari qalin (strong) harflarda beriladi
        # Bu yerda oddiy regex tekshiruv namunasini ishlatamiz yoki aniq HTML klaslarni topamiz:
        text_content = soup.get_text()
        
        # 1. Muddatni (Deadline) izlash
        # Masalan: "Oxirgi muddat:" yozuvidan keyingi sanani qidirish
        deadline_match = re.search(r'(?i)(oxirgi muddat|muddat|deadline)[:\-]*\s*([\w\s,]+202\d)', text_content)
        if deadline_match:
            details["deadline"] = deadline_match.group(2).strip()
            
        # 2. Yo'nalishlarni izlash (Category)
        cat_match = re.search(r'(?i)(yo\'nalish|soha|talablar)[:\-]*\s*([\w\s,]+)', text_content)
        if cat_match:
            details["category"] = cat_match.group(2).strip()[:50] # Juda uzun ketib qolmasligi uchun
            
        # 3. GPA qidiramiz
        gpa_match = re.search(r'(?i)GPA.*?(\d\.\d)', text_content)
        if gpa_match:
            details["min_gpa"] = float(gpa_match.group(1))
            
    except Exception as e:
        pass # Sahifani o'qishda xatolik bo'lsa bo'sh qaytadi
        
    return details

def scrape_grantlar_uz():
    URL = 'https://grantlar.uz/grant/'
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    print(f"\n🌐 Saytdan ma'lumotlar yig'ilmoqda: {URL}")
    existing_links = get_existing_links()
    
    try:
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print("❌ Saytga bog'lanishda xatolik:", e)
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Saytning grant kartalarini qidiramiz (class lari o'zgarishi mumkin, h3 dagi a teglar yig'iladi)
    articles = soup.find_all('article')
    if not articles:
        # Alternativa sifatida a teglari orqali qidiramiz
        articles = soup.find_all('div', class_=re.compile(r'post|card'))
        
    new_grants_count = 0
    for article in articles:
        title_tag = article.find('h3')
        if not title_tag:
            continue
            
        a_tag = title_tag.find('a')
        if not a_tag:
            continue
            
        title = a_tag.get_text(strip=True)
        link = a_tag.get('href')
        
        # Sanani oddiy matndan ajratib olamiz
        date_element = article.find('time') or article.find('span', class_='date')
        posted_date = date_element.get_text(strip=True) if date_element else ""

        # Dublikat tekshiruvi!
        if link in existing_links:
            print(f"⏩ Bazada mavjud (O'tkazildi): {title}")
            continue
            
        print(f"⏳ Yangi topildi: {title}")
        print(f"  Ichki sahifa tahlil qilinmoqda...")
        
        # Batafsil sahifaga kirish va qo'shimcha ma'lumotlarni yig'ish
        details = extract_deadline_and_category(link)
        time.sleep(1) # Saytni bloklab qo'ymasligi uchun pauza
        
        # Grant obyekti tuzamiz
        grant_data = {
            "title": title,
            "sourceUrl": link,
            "postedDate": posted_date,
            "deadline": details["deadline"] or "Noma'lum",
            "category": details["category"],
            "min_gpa": details["min_gpa"],
            "country": "Xalqaro", # Standart qiymat
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        # Firebase ga saqlash
        db.collection('grants').add(grant_data)
        existing_links.add(link)
        new_grants_count += 1
        print(f"  ✅ Saqlandi: Deadline - {grant_data['deadline']}, GPA - {grant_data['min_gpa']}")
        
    print(f"\n🎉 VAZIFA YAKUNLANDI! Dastur {new_grants_count} ta yangi grantni bazaga yukladi.")

if __name__ == "__main__":
    scrape_grantlar_uz()
