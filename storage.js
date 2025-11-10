// storage.js
// Módulo para gerenciamento de armazenamento no LocalStorage

const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    INVESTMENTS: 'investments'
};

/**
 * Obtém os gastos do LocalStorage.
 * @returns {Array} Array de objetos de gastos.
 */
function getExpenses() {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
}

/**
 * Salva os gastos no LocalStorage.
 * @param {Array} expenses - Array de objetos de gastos.
 */
function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

/**
 * Obtém os investimentos do LocalStorage.
 * @returns {Array} Array de objetos de investimentos.
 */
function getInvestments() {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    return data ? JSON.parse(data) : [];
}

/**
 * Salva os investimentos no LocalStorage.
 * @param {Array} investments - Array de objetos de investimentos.
 */
function saveInvestments(investments) {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
}