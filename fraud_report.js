// As importações do Firebase foram ajustadas para a versão 11.6.1, que é a mais estável para CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// Mantendo apenas o Firestore, pois não usaremos Auth ou Analytics
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ----------------------------------------------------------------------
// 1. CONFIGURAÇÃO HARDCODED
// ----------------------------------------------------------------------

// Sua configuração do Firebase, forçada.
const firebaseConfig = {
    apiKey: "AIzaSyAc_HXPzSCLrrsHb24rLVVAwR7vZUQECEw",
    authDomain: "mocam-e2424.firebaseapp.com",
    projectId: "mocam-e2424", // Usado como App ID para o caminho do Firestore
    storageBucket: "mocam-e2424.firebasestorage.app",
    messagingSenderId: "169837622214",
    appId: "1:169837622214:web:7058753277b652f751b8c7",
    measurementId: "G-QMBHB2CDV5"
};

const appId = firebaseConfig.projectId; // Define o App ID como o Project ID
const FORMSPREE_URL = "https://formspree.io/f/mnngnqgq";

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------------------------------------------------------
// 2. FUNÇÕES DE UTILIDADE (Modal e Loading)
// ----------------------------------------------------------------------

function showModal(title, message) {
    // Exibe o modal (depende do seu HTML ter um modal com os IDs 'notificationModal', 'modalTitle', 'modalMessage')
    const modal = document.getElementById('notificationModal');
    if (modal) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        console.warn(`[Modal Fallback] ${title}: ${message}`);
    }
}

function toggleLoading(isLoading) {
    // Controla o estado do botão de envio
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const button = document.getElementById('submitButton');

    if (button) button.disabled = isLoading;

    if (buttonText) {
        if (isLoading) {
            buttonText.classList.add('hidden');
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (button) button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            buttonText.classList.remove('hidden');
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            if (button) button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

// ----------------------------------------------------------------------
// 3. MANIPULADOR DE SUBMISSÃO PRINCIPAL
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona listener para fechar o modal
    const closeButton = document.getElementById('modalCloseButton');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            document.getElementById('notificationModal').classList.add('hidden');
            document.getElementById('notificationModal').classList.remove('flex');
        });
    }

    const reportForm = document.getElementById('fraudReportForm'); // Assumindo ID do form como 'fraudReportForm'
    
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading(true);

            // Captura os valores dos campos
            const formData = {
                clientName: document.getElementById('client-name')?.value || '',
                clientPhone: document.getElementById('client-phone')?.value || '',
                reportType: document.getElementById('report-type')?.value || '',
                reportDescription: document.getElementById('report-description')?.value || '',
                // Adiciona o timestamp para o Firestore
                timestamp: serverTimestamp() 
            };
            
            // Define o caminho correto para o Firestore (público)
            const collectionPath = `artifacts/${appId}/public/data/reports`;

            try {
                // 1. Envia os dados para o Firestore (Garantia de Entrega)
                const docRef = await addDoc(collection(db, collectionPath), formData);
                console.log("Documento escrito no Firestore com ID: ", docRef.id);

                // 2. Envia os dados por e-mail via Formspree (Secundário)
                // Fazemos o envio sem esperar a resposta para não atrasar a mensagem de sucesso
                fetch(FORMSPREE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify(formData)
                }).then(res => {
                    if (res.ok) console.log("E-mail enviado com sucesso via Formspree!");
                    else console.error("Erro ao enviar e-mail via Formspree.");
                }).catch(err => console.error("Erro de rede ao enviar para Formspree:", err));
                
                // Exibe mensagem de sucesso e limpa o formulário
                showModal("Denúncia Enviada!", `Seu relatório foi salvo com sucesso no ID: ${docRef.id}.`);
                reportForm.reset();

            } catch (e) {
                console.error("Erro ao adicionar documento: ", e);
                // Exibe mensagem de erro
                showModal(
                    "Erro ao Enviar", 
                    `Ocorreu um erro ao salvar a denúncia. Verifique a chave da API e a conexão. Detalhes: ${e.message}`
                );
            } finally {
                toggleLoading(false);
            }
        });
    }
});
