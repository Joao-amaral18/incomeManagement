// app.js
// Módulo principal para inicialização e eventos

// Gera ID único simples
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Evento para adicionar gasto
document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('expense-description').value;
    const value = document.getElementById('expense-value').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;

    const newExpense = { id: generateId(), description, value, category, date };
    currentExpenses.push(newExpense);
    saveExpenses(currentExpenses);
    renderExpenses();
    updateDashboard();
    e.target.reset();
    alert('Gasto adicionado com sucesso!'); // Feedback visual
});

// Evento para adicionar investimento
document.getElementById('investment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('investment-type').value;
    const value = document.getElementById('investment-value').value;
    const date = document.getElementById('investment-date').value;
    const yieldValue = document.getElementById('investment-yield').value;

    const newInvestment = { id: generateId(), type, value, date, yield: yieldValue };
    currentInvestments.push(newInvestment);
    saveInvestments(currentInvestments);
    renderInvestments();
    updateDashboard();
    e.target.reset();
    alert('Investimento adicionado com sucesso!'); // Feedback visual
});

// Função para excluir gasto
function deleteExpense(id) {
    currentExpenses = currentExpenses.filter(exp => exp.id !== id);
    saveExpenses(currentExpenses);
    renderExpenses();
    updateDashboard();
    alert('Gasto excluído!'); // Feedback
}

// Função para excluir investimento
function deleteInvestment(id) {
    currentInvestments = currentInvestments.filter(inv => inv.id !== id);
    saveInvestments(currentInvestments);
    renderInvestments();
    updateDashboard();
    alert('Investimento excluído!'); // Feedback
}

// Inicialização
window.addEventListener('load', () => {
    showSection('dashboard');
    // Preenche select de meses (já está no HTML, mas poderia dinamizar)
});