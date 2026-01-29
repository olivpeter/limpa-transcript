// Inicializa ícones
lucide.createIcons();

// Elementos DOM - Abas
const tabFile = document.getElementById('tab-file');
const tabPaste = document.getElementById('tab-paste');
const sectionFile = document.getElementById('section-file');
const sectionPaste = document.getElementById('section-paste');

// Elementos DOM - Arquivo
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultAreaFile = document.getElementById('resultAreaFile');
const originalTextFile = document.getElementById('originalTextFile');
const cleanedTextFile = document.getElementById('cleanedTextFile');
const displayFileName = document.getElementById('displayFileName');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Elementos DOM - Colar
const pasteInput = document.getElementById('pasteInput');
const pasteOutput = document.getElementById('pasteOutput');

let currentFileName = '';

// --- Lógica de Limpeza ---
function cleanTranscript(text) {
    const lines = text.split('\n');
    // Regex para formato Premiere: 00:00:00:00 - 00:00:00:00
    const premiereRegex = /^\s*\d{2}:\d{2}:\d{2}:\d{2}\s*-\s*\d{2}:\d{2}:\d{2}:\d{2}\s*$/;
    // Regex para formato Youtube: 0:00 ou 00:00 ou 0:00:00
    const youtubeRegex = /^\s*\d{1,2}:\d{2}(?::\d{2})?\s*$/;
    // Regex para formato Whisper: 00:00:00.000 --> 00:00:00.000
    const whisperRegex = /^\s*\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\s*$/;
    
    const validLines = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (!trimmedLine) return; // Pula vazias
        if (premiereRegex.test(trimmedLine)) return; // Pula timestamps Premiere
        if (youtubeRegex.test(trimmedLine)) return; // Pula timestamps Youtube
        if (whisperRegex.test(trimmedLine)) return; // Pula timestamps Whisper
        if (trimmedLine.toLowerCase() === 'unknown') return; // Pula 'Unknown'  

        validLines.push(trimmedLine);
    });

    let result = validLines.join(' ');
    result = result.replace(/\s+/g, ' '); // Remove espaços duplos
    return result;
}

// --- Gerenciamento de Abas ---
function switchTab(tab) {
    if (tab === 'file') {
        sectionFile.classList.remove('hidden');
        sectionPaste.classList.add('hidden');
        
        tabFile.classList.add('text-blue-600', 'border-blue-600');
        tabFile.classList.remove('text-gray-500', 'border-transparent');
        
        tabPaste.classList.remove('text-blue-600', 'border-blue-600');
        tabPaste.classList.add('text-gray-500', 'border-transparent');
        
        // Reset inputs when switching? Maybe not required but good practice if requested.
        // User didn't request behavior change, so I'll keep it as is.
    } else {
        sectionFile.classList.add('hidden');
        sectionPaste.classList.remove('hidden');
        
        tabPaste.classList.add('text-blue-600', 'border-blue-600');
        tabPaste.classList.remove('text-gray-500', 'border-transparent');
        
        tabFile.classList.remove('text-blue-600', 'border-blue-600');
        tabFile.classList.add('text-gray-500', 'border-transparent');
    }
}

// --- Lógica: Upload de Arquivo ---
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('bg-blue-50', 'border-blue-500');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('bg-blue-50', 'border-blue-500');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('bg-blue-50', 'border-blue-500');
    const file = e.dataTransfer.files[0];
    processFile(file);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
});

function processFile(file) {
    errorMessage.classList.add('hidden');
    if (!file) return;
    if (file.type !== 'text/plain') {
        showError('Por favor, use apenas arquivos de texto (.txt)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        currentFileName = file.name.replace('.txt', '_limpo.txt');
        displayFileName.textContent = currentFileName;

        originalTextFile.value = content;
        cleanedTextFile.value = cleanTranscript(content);

        uploadArea.classList.add('hidden');
        resultAreaFile.classList.remove('hidden');
    };
    reader.onerror = () => showError('Erro ao ler o arquivo.');
    reader.readAsText(file);
}

function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function resetFileApp() {
    fileInput.value = '';
    originalTextFile.value = '';
    cleanedTextFile.value = '';
    currentFileName = '';
    resultAreaFile.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// --- Lógica: Colar Texto ---
pasteInput.addEventListener('input', () => {
    const rawText = pasteInput.value;
    if (rawText.trim()) {
        pasteOutput.value = cleanTranscript(rawText);
    } else {
        pasteOutput.value = '';
    }
});

function clearPasteArea() {
    pasteInput.value = '';
    pasteOutput.value = '';
}

// --- Download Genérico ---
function downloadFileResult(source) {
    let textToSave = '';
    let fileName = '';

    if (source === 'file') {
        textToSave = cleanedTextFile.value;
        fileName = currentFileName || 'transcricao_limpa.txt';
    } else {
        textToSave = pasteOutput.value;
        fileName = 'texto_colado_limpo.txt';
    }

    if (!textToSave) {
        alert('Não há texto para baixar.');
        return;
    }

    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
