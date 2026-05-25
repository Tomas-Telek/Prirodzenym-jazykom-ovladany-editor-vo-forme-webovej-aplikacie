# Prirodzeným jazykom ovládaný editor vo forme webovej aplikácie

Tento repozitár obsahuje zdrojové kódy k bakalárskej práci na tému **Prirodzeným jazykom ovládaný editor vo forme webovej aplikácie**. Cieľom projektu je vytvoriť webový textový editor, ktorý umožňuje úpravu textu prostredníctvom hlasových príkazov v slovenskom alebo anglickom jazyku.

## 🚀 Kľúčové vlastnosti
- **Hlasové ovládanie:** Prevod reči na text pomocou modelu OpenAI Whisper.
- **Spracovanie príkazov:** Detekcia kľúčových slov a sémantická analýza hlasových pokynov.
- **Detekcia aktivity reči (VAD):** Optimalizácia nahrávania pomocou Silero VAD.
- **Moderné UI:** Responzívne rozhranie postavené na Reacte a Vite.

##  Technológie
- **Frontend:** React, TypeScript, Vite
- **Spracovanie reči:** OpenAI Whisper API / VAD (ricky0123/vad-web)

## Požiadavky a inštalácia
Pre spustenie aplikácie potrebujete mať nainštalovaný [Node.js](https://nodejs.org/).


1. **Inštalácia závislostí:**
   ```bash
   npm install

2. Spustenie vývojového servera:
   ```bash
    npm run dev

3. Konfigurácia:
    Aplikácia vyžaduje prístup k OpenAI API. Vo webovom rozhraní aplikácie vložte svoj API kľúč do príslušného poľa. Ak ešte API kľúč nemáte, viete si jeden založiť na stránke https://platform.openai.com/api-keys.


📖 Ako aplikáciu používať

1. Výber jazyka: V pravom hornom rohu sa nachádza prepínač jazyka. Môžete si vybrať medzi slovenčinou (SJL) a angličtinou (ENG). Aplikácia bude následne očakávať príkazy v zvolenom jazyku.

2. Aktivácia: Kliknite na tlačidlo "Začni AI počúvanie". V tomto momente sa aktivuje VAD (Voice Activity Detection), ktorá začne snímať váš hlas.

3. Zadávanie príkazov: Môžete začať diktovať text alebo zadávať editačné príkazy.



## 📖 Funkcionalita a používanie

Aplikácia je navrhnutá tak, aby hlasovými príkazmi plne nahradila bežné manuálne úkony v editore. Systém rozlišuje medzi diktovaním a riadením prostredníctvom špecializovaných agentov a funkcií:

### Dostupné funkcie a agenti:
* **Diktovanie:** Slúži na priame dopĺňanie textu. Zachytená reč sa v tomto režime neanalyzuje ako príkaz, ale sa jednoducho pripojí na koniec aktuálneho odseku.
* **Edit Agent:** Zameriava sa na prepisovanie už existujúceho textu. Na základe pokynu dokáže zmeniť slová a vety, opraviť v ňom chyby alebo ho preštylizovať.
* **Creative Agent:** Tento agent sa využíva na generovanie nového obsahu. Na rozdiel od bežnej úpravy tento modul text nenahrádza, ale vytvára nové nápady alebo pokračovanie textu, ktoré následne pripojí k existujúcemu obsahu.
* **Navigačná funkcia:** Zabezpečuje pohyb v dokumente. Interpretuje príkazy na zmenu aktívneho odseku, čím nahrádza manuálne klikanie myšou medzi jednotlivými blokmi textu.
* **Funkcia pre štruktúru:** Funkcia rieši manipuláciu s blokmi textu. Dokáže na základe povelu vymazať konkrétny odsek alebo vložiť nový prázdny odsek pred či za aktuálnu pozíciu.
* **Správa histórie (Undo):** Systém umožňuje vrátiť sa o krok späť v prípade chyby alebo nespokojnosti s výsledkom. Pri každej zmene textu sa aktuálny stav odsekov uloží do histórie.
* **Vizuálne nastavenia:** Systém dokáže na základe jednoduchého povelu vykonať okamžitú zmenu veľkosti písma v editore.

### Príklady hlasových príkazov:
- **Diktovanie:** *"Dnes budem pracovať na implementácii agentov."*
- **Editácia:** *"Preštylizuj poslednú vetu tak, aby znela viac formálne."*
- **Kreativita:** *"Navrhni tri body, ako by mohol tento text pokračovať."*
- **Navigácia:** *"Choď na predchádzajúci odsek."*
- **Štruktúra:** *"Vlož nový odsek za tento blok textu."*
- **Nastavenia:** *"Zväčši písmo v editore."*
- **História:** *"Vráť poslednú zmenu."*


Autor: Tomáš Telek

Vedúci práce: RNDr. Andrej Lúčny, PhD.

Fakulta: FMFI UK, Bratislava, 2026