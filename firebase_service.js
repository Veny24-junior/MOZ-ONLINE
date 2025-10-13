// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAc_HXPzSCLjrsHb24rLVVAwR7vZUQECEw",
    authDomain: "mocam-e2424.firebaseapp.com",
    projectId: "mocam-e2424",
    storageBucket: "mocam-e2424.appspot.com",
    messagingSenderId: "169837622214",
    appId: "1:169837622214:web:7058753277b652f751b8c7",
    measurementId: "G-QMBHB2CDV5"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL do Formspree API
const FORMSPREE_URL = "https://formspree.io/f/mnngnqgq";

// Contador para rastrear quantos campos foram adicionados (máximo de 3)
let evidenceCount = 0;
const MAX_EVIDENCE = 3;

/**
 * Converte um arquivo File para a string codificada em Base64.
 * @param {File} file O arquivo de imagem a ser convertido.
 * @returns {Promise<string|null>} A string Base64 do arquivo, ou null se não houver arquivo/exceder limite.
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve(null);
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            alert(`O arquivo "${file.name}" excede o limite de 5MB e será ignorado.`);
            return resolve('Arquivo Excedeu Limite (5MB)');
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Adiciona um campo de upload de arquivo dinamicamente ao formulário, incluindo pré-visualização.
 */
function addEvidenceField() {
    if (evidenceCount >= MAX_EVIDENCE) return;

    evidenceCount++;
    const container = document.getElementById('evidence-container');
    const fieldId = `report-evidence-${evidenceCount}`;

    // Cria o novo elemento de prova
    const fieldDiv = document.createElement('div');
    fieldDiv.id = `evidence-field-${evidenceCount}`;
    fieldDiv.className = 'space-y-2 border border-gray-100 p-3 rounded-lg';
    fieldDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <label for="${fieldId}" class="block text-sm font-medium text-gray-700">Prova ${evidenceCount}</label>
            <button type="button" data-field-id="${evidenceCount}" class="remove-evidence-btn text-red-500 hover:text-red-700 text-xs font-semibold">Remover</button>
        </div>
        <input type="file" id="${fieldId}" name="${fieldId}" accept="image/*" class="file-input">
        <img id="preview-${fieldId}" class="preview-image hidden" src="#" alt="Pré-visualização da imagem">
    `;
    container.appendChild(fieldDiv);

    // Adiciona o Event Listener para a pré-visualização
    const fileInput = document.getElementById(fieldId);
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById(`preview-${fieldId}`);
        
        // Verifica o tipo de arquivo antes de mostrar a pré-visualização
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
            preview.src = '#';
        }
    });

    // Atualiza o botão 'Adicionar'
    updateAddButtonVisibility();
}

/**
 * Remove um campo de upload de arquivo dinamicamente.
 */
function removeEvidenceField(id) {
    const field = document.getElementById(`evidence-field-${id}`);
    if (field) {
        field.remove();
    }

    // Reinicia a contagem e reordena os IDs
    reorderEvidenceFields();
    updateAddButtonVisibility();
}

/**
 * Reordena os IDs dos campos de evidência após uma remoção.
 */
function reorderEvidenceFields() {
    const container = document.getElementById('evidence-container');
    const fields = container.querySelectorAll('[id^="evidence-field-"]');
    
    evidenceCount = 0;
    fields.forEach((field, index) => {
        const newIndex = index + 1;
        field.id = `evidence-field-${newIndex}`;
        evidenceCount = newIndex;

        // Atualiza elementos internos
        const label = field.querySelector('label');
        if(label) label.textContent = `Prova ${newIndex}`;

        const input = field.querySelector('input[type="file"]');
        if(input) {
            input.id = `report-evidence-${newIndex}`;
            input.name = `report-evidence-${newIndex}`;
        }
        
        const preview = field.querySelector('img');
        if(preview) preview.id = `preview-report-evidence-${newIndex}`;
        
        const removeBtn = field.querySelector('.remove-evidence-btn');
        if(removeBtn) removeBtn.setAttribute('data-field-id', newIndex);
    });
}


/**
 * Controla a visibilidade do botão 'Adicionar Prova'.
 */
function updateAddButtonVisibility() {
    const addBtn = document.getElementById('add-evidence-btn');
    if (evidenceCount >= MAX_EVIDENCE) {
        addBtn.classList.add('hidden');
    } else {
        addBtn.classList.remove('hidden');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-case-form');
    const feedbackElement = document.getElementById('report-feedback');
    const addEvidenceBtn = document.getElementById('add-evidence-btn');

    // Inicializa o primeiro campo de evidência
    addEvidenceField();

    // Event Listeners para botões dinâmicos
    addEvidenceBtn.addEventListener('click', addEvidenceField);
    document.getElementById('evidence-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-evidence-btn')) {
            // Certifique-se de pegar o data-field-id do botão
            const id = e.target.getAttribute('data-field-id');
            if(id) removeEvidenceField(id);
        }
    });


    // Lógica de anonimato (inalterada)
    const contactFieldsContainer = document.getElementById('contact-fields');
    const contactInputs = contactFieldsContainer.querySelectorAll('input:not([type="radio"])'); 
    const reportingOptions = document.querySelectorAll('input[name="reporting-option"]');

    const toggleContactFields = () => {
        const isAnonymous = document.getElementById('option-anonymous').checked;
        if (isAnonymous) {
            contactFieldsContainer.style.maxHeight = '0'; 
            contactFieldsContainer.style.opacity = '0';
            contactInputs.forEach(input => input.removeAttribute('required'));
        } else {
            contactFieldsContainer.style.maxHeight = '200px'; 
            contactFieldsContainer.style.opacity = '1';
            contactInputs.forEach(input => input.setAttribute('required', 'true'));
        }
    };
    reportingOptions.forEach(option => {
        option.addEventListener('change', toggleContactFields);
    });
    toggleContactFields(); 
    
    // ------------------------------------------------------------------
    // LÓGICA DE SUBMISSÃO DO FORMULÁRIO
    // ------------------------------------------------------------------
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        feedbackElement.textContent = "A converter evidências para Base64...";
        feedbackElement.classList.remove('hidden');
        feedbackElement.style.color = 'gray';

        // 1. Coleta os arquivos ativos (até o limite MAX_EVIDENCE)
        const evidenceFiles = [];
        for (let i = 1; i <= MAX_EVIDENCE; i++) {
            const input = document.getElementById(`report-evidence-${i}`);
            // Adiciona o arquivo se o campo existir e houver um arquivo selecionado
            if (input && input.files && input.files[0]) {
                evidenceFiles.push(input.files[0]);
            } else {
                evidenceFiles.push(null); 
            }
        }
        
        // 2. CONVERTE TODOS OS ARQUIVOS (ativos) PARA BASE64
        const base64Results = await Promise.all(evidenceFiles.map(file => fileToBase64(file)));
        
        // 3. Captura os valores restantes do formulário
        const isAnonymous = document.getElementById('option-anonymous').checked;

        const formData = {
            // Campos de Contato
            clientName: isAnonymous ? 'Anônimo' : document.getElementById('client-name').value,
            clientPhone: isAnonymous ? 'Anônimo' : document.getElementById('client-phone').value,
            reportMode: isAnonymous ? 'Anônimo' : 'Identificado', 

            // Campos da Fraude
            reportType: document.getElementById('report-type').value,
            occurrenceDate: document.getElementById('occurrence-date').value || 'Não Especificado',
            occurrenceLocation: document.getElementById('occurrence-location').value || 'Não Especificado',
            reportDescription: document.getElementById('report-description').value,

            // Evidências Base64 (Mapeia os resultados para evidence1, evidence2, evidence3)
            evidence1: base64Results[0] || 'Nenhuma Prova Anexada',
            evidence2: base64Results[1] || 'Nenhuma Prova Anexada',
            evidence3: base64Results[2] || 'Nenhuma Prova Anexada',
        };

        const dataToSave = {
            ...formData, 
             
            timestamp: serverTimestamp() 
        };

        feedbackElement.textContent = "A enviar denúncia para o banco de dados...";
        feedbackElement.style.color = 'gray';

        try {
            // 4. Envia para o Firestore
            const docRef = await addDoc(collection(db, "reports"), dataToSave);
            console.log("Documento escrito com ID: ", docRef.id);

            // 5. Envia para o Formspree (versão mais limpa para e-mail)
            const evidenceSummary = base64Results
                .filter(r => r && r !== 'Arquivo Excedeu Limite (5MB)')
                .length;
            
            const emailData = {
                ...formData,
                'ID do Firestore': docRef.id,
                'Sumário das Provas': `${evidenceSummary} Prova(s) Base64 Anexada(s) (Verificar Firestore)`,
                // Remove os campos base64 longos do email
                evidence1: undefined, 
                evidence2: undefined, 
                evidence3: undefined, 
            };

            const formspreeResponse = await fetch(FORMSPREE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(emailData) 
            });

            if (!formspreeResponse.ok) {
                console.error("Atenção: Erro ao enviar e-mail via Formspree, mas o dado foi salvo no Firestore.");
            } else {
                console.log("E-mail enviado com sucesso via Formspree!");
            }
            
            // 6. Feedback e Reset
            feedbackElement.textContent = "A sua denúncia foi enviada com sucesso! Obrigado por reportar.";
            feedbackElement.style.color = 'green';
            reportForm.reset();
            toggleContactFields(); 
            
            // Limpa e reinicia os campos de evidência para o estado inicial
            document.getElementById('evidence-container').innerHTML = '';
            evidenceCount = 0;
            addEvidenceField(); 
            updateAddButtonVisibility(); // Garante que o botão Add Prova esteja visível

            setTimeout(() => {
                feedbackElement.classList.add('hidden');
            }, 5000);


        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
            feedbackElement.textContent = "Ocorreu um erro ao enviar. Tente novamente.";
            feedbackElement.style.color = 'red';
        }
    });
});