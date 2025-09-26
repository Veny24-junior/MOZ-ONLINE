
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAc_HXPzSCLjrsHb24rLVVAwR7vZUQECEw",
    authDomain: "mocam-e2424.firebaseapp.com",
    projectId: "mocam-e2424",
    storageBucket: "mocam-e2424.firebasestorage.app",
    messagingSenderId: "169837622214",
    appId: "1:169837622214:web:7058753277b652f751b8c7",
    measurementId: "G-QMBHB2CDV5"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Adicione a sua URL do Formspree aqui. Obtenha-a no site do Formspree.
const FORMSPREE_URL = "https://formspree.io/f/mnngnqgq";

/// Lógica para enviar o formulário
document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-case-form');
    const feedbackElement = document.getElementById('report-feedback');

    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura os valores dos campos
        const formData = {
            clientName: document.getElementById('client-name').value,
            clientPhone: document.getElementById('client-phone').value,
            reportType: document.getElementById('report-type').value,
            reportDescription: document.getElementById('report-description').value,
        };

        // Adiciona o timestamp para o Firestore
        const dataToSave = {
            ...formData,
            timestamp: serverTimestamp()
        };

        // Reseta o feedback visual e mostra uma mensagem de "enviando"
        feedbackElement.textContent = "Enviando...";
        feedbackElement.classList.remove('hidden');
        feedbackElement.style.color = 'gray';

        try {
            // 1. Envia os dados para o Firestore
            const docRef = await addDoc(collection(db, "reports"), dataToSave);
            console.log("Documento escrito com ID: ", docRef.id);

            // 2. Envia os dados por e-mail via Formspree
            // Usamos a função fetch para fazer uma requisição POST
            const formspreeResponse = await fetch(FORMSPREE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (formspreeResponse.ok) {
                console.log("E-mail enviado com sucesso via Formspree!");
            } else {
                console.error("Erro ao enviar e-mail via Formspree.");
            }
            
            // Exibe mensagem de sucesso e limpa o formulário
            feedbackElement.textContent = "Sua denúncia foi enviada com sucesso!";
            feedbackElement.style.color = 'green';
            reportForm.reset();

        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
            // Exibe mensagem de erro
            feedbackElement.textContent = "Ocorreu um erro ao enviar. Tente novamente.";
            feedbackElement.style.color = 'red';
        }
    });
});